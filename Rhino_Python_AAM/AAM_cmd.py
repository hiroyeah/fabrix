import rhinoscriptsyntax as rs
import Rhino as rhino
from System.Drawing import Color
import math
#import gcodeGenerater

__commandname__ = "AAM_Planar"

"""
To do

#important

#important
adapt to curved surface

#important
middle surface

move to first point safely




warning for angle of baseSurface

Printing Speed!!!!

get variables of print setting
3d printing setting file by xml

"""

class AAM_Planar():

    #def __init__(self, _gcoder, _printSetter):
    def __init__(self, _gcoder):

        self.gcoder = _gcoder
        #self.printSetter = _printSetter


        self.normalVec = None
        self.addtiveObj = None
        self.baseSurface = None
        self.layerHeight = None

        #sliceSurface is used for slicing addtiveObj
        self.sliceSurface = None
        self.fixedLayerHeight = None

        self.prePoint = None
        self.angleOfBaseSurface = None

        self.basePointForPlane = None


        self.paralellIntersectedCurves = []
        self.indexParalellSurfaces = []

        self.EValue = 0


        self.infillRatio = 0.05

        return

    def main(self):
        print("####### AAM Starts #######")
        #this code is for only planar surface
        if not self.setNormalVec():
            return
        if not self.setAdditiveObj():
            return

        self.setSurfaceForSlicing()


        #setter
        self.setPrintingSetting()


        self.detectParalellSurface()

        #set layer for sliced lines
        '''
        if rs.IsLayer("gcode_line"):
            pass
        else:
            rs.AddLayer("gcode_line", Color.Red, True, False, None)
        '''

        #self.setLayerFill()
        self.slice()
        print('slicing done')

        self.clean()



    def setAngleOfBaseSurface(self):

        tmpVector = (0,0,1)
        self.angleOfSurface = rs.VectorAngle(tmpVector,self.normalVec)

        #for debug
        if self.angleOfSurface < 0 or self.angleOfSurface > 90:
            print('self.angleOfSurface is wseird')



    def setNormalVec(self):
        #set normal vector from selected base surface
        #if selected base surface isn't planar, return False

        self.baseSurface = rs.GetSurfaceObject("Select surface to be addded object")
        if self.baseSurface == None:
            return False

        rs.SelectObject(self.baseSurface[0])

        if not rs.IsSurfacePlanar(self.baseSurface[0]):
            print("Selected Surface is not planar\nPlease select planar surface")
            return False

        print("Confirm direction to add object")
        rs.Command("Dir")

        self.normalVec = rs.SurfaceNormal(self.baseSurface[0], [0,0])

        rs.UnselectAllObjects()

        self.setAngleOfBaseSurface()

        return True


    def setAdditiveObj(self):
        #set object to be additived
        #if selected obj isnt closed, return False

        tmp = rs.GetObject("Select object which you want additive")

        #adapt to unclosed polysurface
        if rs.IsMesh(tmp):
            self.addtiveObj = rs.MeshToNurb(tmp)

        elif rs.IsPolysurface(tmp):
            self.addtiveObj = tmp

        else:
            print("please select \"mesh\" or \"polysurface\"")

        return True



    #calculate distance from bottom to top
    def calcDistance(self, plane, editPoints):
        forDistance = []

        for i in range(len(editPoints)):
            if i == 0:
                forDistance.append(editPoints[0])
                forDistance.append(rs.DistanceToPlane(plane, editPoints[0]))
            else:
                tmpDistance = rs.DistanceToPlane(plane, editPoints[i])
                if tmpDistance > forDistance[1]:
                    forDistance[0] = editPoints[i]
                    forDistance[1] = tmpDistance

        self.distancePrinting = rs.DistanceToPlane(plane, forDistance[0])

        #adapt to Z Axis
        self.distancePrinting *= (1.0 / math.cos(math.radians(self.angleOfSurface)))

        if self.distancePrinting < 0:
            self.distancePrinting *= -1

        return

    def setSurfaceForSlicing(self):


        explodedSurfaces = rs.ExplodePolysurfaces(self.addtiveObj)
        editPoint = []

        #get editPoint from polysurfaces
        if len(explodedSurfaces) == 0:
            #use obj
            meshed = rhino.Geometry.Mesh.CreateFromBrep(rs.coercebrep(self.addtiveObj))
            editPoint = rs.MeshVertices(meshed[0])

        else:
            for i in explodedSurfaces:
                meshed = rhino.Geometry.Mesh.CreateFromBrep(rs.coercebrep(i))
                vertices = rs.MeshVertices(meshed[0])
                editPoint.extend(vertices)

        rs.DeleteObjects(explodedSurfaces)



        minValue = []
        maxValue = []
        basePointForPlane = None
        basePointForDistance = None

        for i in range(len(editPoint)):
            if i == 0:
                basePointForPlane = editPoint[0]
                basePointForDistance = editPoint[0]

                for j in range(3):
                    minValue.append(editPoint[0][j])
                    maxValue.append(editPoint[0][j])
                continue

            else:
                if basePointForPlane[2] > editPoint[i][2]:
                    basePointForPlane = editPoint[i]
                if basePointForDistance[2] < editPoint[i][2]:
                    basePointForDistance = editPoint[i]

                for j in range(3):
                    if minValue[j] > editPoint[i][j]:
                        minValue[j] = editPoint[i][j]
                    elif maxValue[j] < editPoint[i][j]:
                        maxValue[j] = editPoint[i][j]

        #why?
        self.basePointForPlane = basePointForPlane

        plane = rs.PlaneFromNormal(basePointForPlane, self.normalVec)


        #calculating distance printing
        self.calcDistance(plane, editPoint)

        #make base surface
        pntForSur = []
        line = (minValue[0], minValue[1], minValue[2]), (minValue[0], minValue[1], maxValue[2])
        pntForSur.append(rs.LinePlaneIntersection(line, plane))
        line = (minValue[0], maxValue[1], minValue[2]), (minValue[0], maxValue[1], maxValue[2])
        pntForSur.append(rs.LinePlaneIntersection(line, plane))
        line = (maxValue[0], maxValue[1], minValue[2]), (maxValue[0], maxValue[1], maxValue[2])
        pntForSur.append(rs.LinePlaneIntersection(line, plane))
        line = (maxValue[0], minValue[1], minValue[2]), (maxValue[0], minValue[1], maxValue[2])
        pntForSur.append(rs.LinePlaneIntersection(line, plane))

        lineForSur = []

        for i in range(4):
            lineForSur.append(rs.AddLine(pntForSur[i], pntForSur[(i+1)%4]))



        joinedCurve = rs.JoinCurves(lineForSur)
        rs.DeleteObjects(lineForSur)

        curveForSur = rs.OffsetCurve(joinedCurve, rs.CurveNormal(joinedCurve), 30)



        self.sliceSurface = rs.AddPlanarSrf(curveForSur)

        if len(curveForSur) > 1 or rs.IsPointOnSurface(self.sliceSurface, rs.CurveStartPoint(joinedCurve)) is False:

            rs.DeleteObjects(curveForSur)
            if self.sliceSurface is not None:
                rs.DeleteObject(self.sliceSurface)

            curveForSur = rs.OffsetCurve(joinedCurve, rs.CurveNormal(joinedCurve), -30)
            self.sliceSurface = rs.AddPlanarSrf(curveForSur)
        rs.DeleteObjects(joinedCurve)
        rs.DeleteObjects(curveForSur)




        self.fixedLayerHeight = float(self.gcoder.getLayerHeight() * (1.0 / math.cos(math.radians(self.angleOfSurface))))

        self.addtiveObj = rs.CopyObject(self.addtiveObj, (0, 0, self.fixedLayerHeight*0.9))
        self.sliceSurface = rs.MoveObject(self.sliceSurface, (0, 0, self.fixedLayerHeight*0.9))



        #Delete lines used for making sliceSurface



    def detectParalellSurface(self):
        #fix layer height


        #self.paralellIntersectedCurve
        #self.indexParalellSurfaces

        explodedSurfaces = rs.ExplodePolysurfaces(self.addtiveObj)

        for surface in explodedSurfaces:
            #normals.append(rs.SurfaceNormal(surface))
            tmpNormal = rs.SurfaceNormal(surface, [0,0])

            gotAngle = rs.VectorAngle(tmpNormal, self.normalVec)
            if gotAngle == 0 or gotAngle == 180:

                tmpPoints = rs.SurfaceEditPoints(surface)
                tmpPlane = rs.PlaneFromNormal(tmpPoints[0], self.normalVec)

                distance = rs.DistanceToPlane(tmpPlane, self.basePointForPlane)


                distance *= (1.0 / math.cos(math.radians(self.angleOfSurface)))
                print("distance")
                print(distance)

                paralellLayer = int(distance / self.fixedLayerHeight)
                if paralellLayer < 0:
                    paralellLayer *= -1

                if paralellLayer == int(self.distancePrinting/self.fixedLayerHeight) or int(distance) == 0:
                    continue

                self.indexParalellSurfaces.append(int(paralellLayer))
                print("paralellLayer")
                print(paralellLayer)
                print("layer num")
                print(self.distancePrinting/self.fixedLayerHeight)
                #there is object to delete
                self.paralellIntersectedCurves.append(rs.JoinCurves(rs.DuplicateEdgeCurves(surface)))

        rs.DeleteObjects(explodedSurfaces)

        """
        #debug
        rs.UnselectAllObjects()
        for i in self.paralellIntersectedCurves:
            rs.SelectObject(i)

        rs.Command("Move")
        """


    '''
    filter 1 => cut outside of cutter
    filter 2 => cut inside of cutter
    '''
    def trim(self, curve, cutter, filter = 1):
        resultLines = []

        intersectedPoints = rs.CurveCurveIntersection(curve, cutter)
        if intersectedPoints == None:
            return None
        tmpSurface = rs.AddPlanarSrf(cutter)

        intersectedPoints = [n[1] for n in intersectedPoints]

        intersectedPoints.insert(0, rs.CurveStartPoint(curve))
        intersectedPoints.insert(len(intersectedPoints), rs.CurveEndPoint(curve))

        for i in range(len(intersectedPoints)-1):

            x = intersectedPoints[i][0] + intersectedPoints[i+1][0]
            y = intersectedPoints[i][1] + intersectedPoints[i+1][1]
            z = intersectedPoints[i][2] + intersectedPoints[i+1][2]

            mid = (x/2.0, y/2.0, z/2.0)

            if tmpSurface is None:
                continue
            if rs.IsPointOnSurface(tmpSurface, mid):
                if filter == 1:
                    resultLines.append(rs.AddLine(intersectedPoints[i], intersectedPoints[i+1]))
                elif filter == 2:
                    continue

            else:
                if filter == 1:
                    continue
                elif filter == 2:
                    resultLines.append(rs.AddLine(intersectedPoints[i], intersectedPoints[i+1]))


        rs.DeleteObject(curve)
        if tmpSurface is not None:
            rs.DeleteObject(tmpSurface)

        return resultLines

















    def slice(self):

        print("Slicing starts")
        print("It may take a long time")
        deleteItem = []

        fileN = rs.SaveFileName("Output file", "G-Code Files (*.gcode)|*.gcode|All Files (*.*)|*.*|")

        self.gcoder.initGcode(fileN)

        tmpText = ""

        #layer by layer
        layer = 0

        for layer in range(int(self.distancePrinting/self.fixedLayerHeight)+1):


            tmpText = "; layer " + str(layer) + "\n"
            #init evalue
            tmpText += "G92 E0\n"
            self.gcoder.addGcode(tmpText)
            self.gcoder.initEValue()

            nextVec = (0, 0, float(self.fixedLayerHeight*layer))
            slicer = rs.CopyObject(self.sliceSurface, nextVec)

            slicedCurves = rs.IntersectBreps(self.addtiveObj, slicer)
            #deleteItem.append(slicedCurves)

            rs.DeleteObject(slicer)
            if slicedCurves == None:
                continue

            '''
            if slicedCurves == None:
                print('slicing done')
                self.gcoder.finishGcode()
                fileN = rs.SaveFileName("Output file", "G-Code Files (*.gcode)|*.gcode|All Files (*.*)|*.*|", None, None)
                self.gcoder.outputFile(fileN)

                return
            '''


            #slicedCurve one by one
            for slicedCurve in slicedCurves:

                if rs.IsCurve(slicedCurve) is False:
                    continue
                if slicedCurve is None:
                    break

                self.makeGcodeFromSlicedCurve(slicedCurve, layer)


            rs.DeleteObjects(slicedCurves)


        print('slicing done')
        self.gcoder.finishGcode()
        #fileN = rs.SaveFileName("Output file", "G-Code Files (*.gcode)|*.gcode|All Files (*.*)|*.*|")
        self.gcoder.outputFile()

        return True





    def makeGcodeFromSlicedCurve(self, slicedCurve, layer):
        deleteItem = []

        tmpText = ""

        #it may shit
        if rs.IsCurveClosed(slicedCurve) is False:

            #slicedCurve = rs.CloseCurve(slicedCurve)
            startPoint = rs.CurveStartPoint(slicedCurve)
            endPoint = rs.CurveEndPoint(slicedCurve)

            curveForFix = rs.AddCurve([startPoint, endPoint])

            curves = []
            curves.append(slicedCurve)
            curves.append(curveForFix)
            slicedCurve = rs.JoinCurves(curves)


        #dirVec = rs.CurveNormal(slicedCurve)
        dirVec = self.normalVec


        #shell by shell
        #shell inside to outside
        for shell in range(self.gcoder.getNumShellOutline()):

            nozzleDia = self.gcoder.getExtruderDiameter()

            '''
            if shell == 0:
                offsetCurve = rs.OffsetCurve(slicedCurve, tuple(dirVec), nozzleDia/2.0)
            else:
                #offsetCurve = rs.OffsetCurve(slicedCurve, tuple(dirVec), self.gcoder.getLayerHeight() * shell)
                offsetCurve = rs.OffsetCurve(slicedCurve, tuple(dirVec), nozzleDia/2.0 + nozzleDia*shell)
            '''

            if shell == self.gcoder.getNumShellOutline()-1:
                ##offsetCurve = rs.OffsetCurve(slicedCurve, dirVec, -nozzleDia/2.0)
                offsetCurve = rs.OffsetCurve(slicedCurve, dirVec, nozzleDia/2.0)

            else:
                try:
                    ##offsetCurve = rs.OffsetCurve(slicedCurve, dirVec, -(nozzleDia/2.0 + nozzleDia*(self.gcoder.getNumShellOutline()-shell-1)))
                    offsetCurve = rs.OffsetCurve(slicedCurve, dirVec, (nozzleDia/2.0 + nozzleDia*(self.gcoder.getNumShellOutline()-shell-1)))
                except:
                    print('offset failed\nslicedCurve')
                    print(slicedCurve)
                    print('dirVec')
                    print(dirVec)

            #skip, when offset fail
            if offsetCurve == None:
                #print('failed to offset curve')
                continue

            if isinstance(offsetCurve, list) and len(offsetCurve) > 1:
                rs.DeleteObjects(offsetCurve)
                continue


            #explodedCurve = rs.ExplodeCurves(offsetCurve)


            #lines from explodedCurve
            #from outline to gcode

            #explodCurve is not enough
            #you need to convert curve to polyline
            #and then get point from editPoint

            prePoint = None
            currentPoint = None
            convertedPolyline = rs.ConvertCurveToPolyline(offsetCurve)
            vertices = rs.CurveEditPoints(convertedPolyline)
            rs.DeleteObject(convertedPolyline)

            flag = True

            for ver in vertices:

                currentPoint = ver
                if flag:
                    tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(currentPoint[0], currentPoint[1], currentPoint[2], 3600)
                    flag = False
                else:
                    self.gcoder.calcEValue(rs.Distance(currentPoint, prePoint))
                    tmpText = "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(currentPoint[0], currentPoint[1], currentPoint[2], self.gcoder.getEValue(), 1800)

                prePoint = currentPoint

                self.gcoder.addGcode(tmpText)


            #rs.DeleteObjects(explodedCurve)

            #from outline to fill gocde
            #if shell is last one, it needs to fill layer or infill

            #inside to outside
            if shell == (self.gcoder.getNumShellOutline()-1):
                rs.DeleteObject(offsetCurve)
                ##offsetCurveForFill = rs.OffsetCurve(slicedCurve, dirVec, -(nozzleDia/2.0 + nozzleDia*(self.gcoder.getNumShellOutline())))
                offsetCurveForFill = rs.OffsetCurve(slicedCurve, dirVec, (nozzleDia/2.0 + nozzleDia*(self.gcoder.getNumShellOutline())))

                #newOffsetCurve = rs.OffsetCurve(offsetCurve, tuple(dirVec), self.gcoder.getLayerHeight())
                if offsetCurveForFill == None:
                    #print('failed to offset curve')
                    break

                if isinstance(offsetCurveForFill, list) and len(offsetCurveForFill) > 1:
                    rs.DeleteObjects(offsetCurveForFill)
                    break

                '''
                offsetCurveForFill = rs.OffsetCurve(offsetCurve, tuple(dirVec), nozzleDia)

                #detect failed to offset
                if isinstance(offsetCurveForFill, list) and len(offsetCurveForFill) > 1:
                    continue
                '''

                #fill for middle paralell layer

                for paralellLayer in range(len(self.paralellIntersectedCurves)):
                    if layer >= self.indexParalellSurfaces[paralellLayer] and abs(layer-self.indexParalellSurfaces[paralellLayer]) < self.gcoder.getNumTopLayer():
                        '''
                        dirVecForParalell = rs.CurveAreaCentroid(self.paralellIntersectedCurves[paralellLayer])
                        dirVecForParalell = dirVecForParalell[0]
                        '''
                        dirVecForParalell = rs.CurveNormal(self.paralellIntersectedCurves[paralellLayer])


                        offsetParalell = rs.OffsetCurve(self.paralellIntersectedCurves[paralellLayer], dirVecForParalell, -(nozzleDia/2.0 + nozzleDia*(self.gcoder.getNumShellOutline())))
                        #debug

                        '''
                        #print('layer')
                        #print(layer)
                        rs.UnselectAllObjects()
                        rs.SelectObject(offsetParalell)
                        rs.Command('Move')
                        '''


                        #it needs to debug, it's close
                        self.setLayerFill(offsetParalell, layer)
                        continue

                        #self.setInfill(vec, newOffsetCurve, offsetParalell)




                if layer < (self.gcoder.getNumBottomLayer()):
                    self.setLayerFill(offsetCurveForFill, layer)
                    rs.DeleteObject(offsetCurveForFill)

                elif layer > (int(self.distancePrinting/self.fixedLayerHeight) - self.gcoder.getNumTopLayer()):

                    self.setLayerFill(offsetCurveForFill, layer)
                    rs.DeleteObject(offsetCurveForFill)

                else:
                    self.setInfill(offsetCurveForFill, layer)
                    if offsetCurveForFill is not None:
                        rs.DeleteObject(offsetCurveForFill)



                #rs.DeleteObjects(newOffsetCurve)

            #DEBUG
            rs.DeleteObjects(offsetCurve)
        rs.DeleteObject(slicedCurve)


    def setLayerFill(self, intersectCurve, index):

        #set baseline, baseVec, dist

        newSliceSurface = rs.CopyObject(self.sliceSurface, (0, 0, float(self.fixedLayerHeight*index)))
        editPoints = rs.SurfaceEditPoints(newSliceSurface)

        #vertical
        if index%2 == 0:

            baseLine = rs.AddLine(editPoints[0], editPoints[1])
            baseVec = (editPoints[2][0]-editPoints[0][0], editPoints[2][1]-editPoints[0][1], editPoints[2][2]-editPoints[0][2])
            dist = rs.Distance(editPoints[0], editPoints[2])

        #horizontal
        elif index%2 == 1:

            baseLine = rs.AddLine(editPoints[0], editPoints[2])
            baseVec = (editPoints[1][0]-editPoints[0][0], editPoints[1][1]-editPoints[0][1], editPoints[1][2]-editPoints[0][2])
            dist = rs.Distance(editPoints[0], editPoints[1])


        #normalize baseVec
        forNormal = math.sqrt(baseVec[0]**2 + baseVec[1]**2 + baseVec[2]**2)
        baseVec = [i/forNormal for i in baseVec]

        #end set baseLine, baseVec, dist

        self.gcoder.addGcode("; layer filling\n")

        flag = False
        for i in range(int(dist/self.gcoder.getExtruderDiameter())+1):
            lines = []

            nextVec = [v*self.gcoder.getExtruderDiameter()*i for v in baseVec]

            #vertical
            if index%2 == 0:
                nextStartPoint = (editPoints[0][0]+nextVec[0], editPoints[0][1]+nextVec[1], editPoints[0][2]+nextVec[2])
                nextEndPoint = (editPoints[1][0]+nextVec[0], editPoints[1][1]+nextVec[1], editPoints[1][2]+nextVec[2])

            if index%2 == 1:
                nextStartPoint = (editPoints[0][0]+nextVec[0], editPoints[0][1]+nextVec[1], editPoints[0][2]+nextVec[2])
                nextEndPoint = (editPoints[2][0]+nextVec[0], editPoints[2][1]+nextVec[1], editPoints[2][2]+nextVec[2])

            nextLine = rs.AddLine(nextStartPoint, nextEndPoint)

            lines = self.trim(nextLine, intersectCurve[0], 1)

            rs.DeleteObject(nextLine)


            if lines is None:
                continue

            if i%2 == 1:
                lines.reverse()

            for j in lines:
                startPoint = rs.CurveStartPoint(j)
                endPoint = rs.CurveEndPoint(j)

                if i%2 == 0:
                    if flag:
                        self.gcoder.calcEValue(rs.Distance(prePoint, startPoint))
                        #tmpText = "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(startPoint[0], startPoint[1], startPoint[2], self.gcoder.getEValue(), 1800)
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(startPoint[0], startPoint[1], startPoint[2], 1800)

                    else:
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(startPoint[0], startPoint[1], startPoint[2], 3600)
                        flag = True

                    self.gcoder.calcEValue(rs.Distance(startPoint, endPoint))
                    tmpText += "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(endPoint[0], endPoint[1], endPoint[2], self.gcoder.getEValue(), 1800)

                    prePoint = endPoint

                elif i%2 == 1:

                    if flag:
                        self.gcoder.calcEValue(rs.Distance(prePoint, endPoint))

                        #tmpText = "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(endPoint[0], endPoint[1], endPoint[2], self.gcoder.getEValue(), 1800)
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(endPoint[0], endPoint[1], endPoint[2], 1800)
                    else:

                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(endPoint[0], endPoint[1], endPoint[2], 3600)
                        flag = True

                    self.gcoder.calcEValue(rs.Distance(startPoint, endPoint))
                    tmpText += "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(startPoint[0], startPoint[1], startPoint[2], self.gcoder.getEValue(), 1800)
                    prePoint = startPoint


                self.gcoder.addGcode(tmpText)



            rs.DeleteObjects(lines)
        rs.DeleteObject(baseLine)
        rs.DeleteObject(newSliceSurface)

    def deleteAlonePoint(self, points, intersectCurve):
        editPoint = rs.CurveEditPoints(intersectCurve)

        for i in editPoint:

            for j in range(len(points)):

                if rs.Distance(i,points[j]) == 0.0:
                    points.pop(j)

        return points


    def setInfill(self, intersectCurve, index, paralellOffset = None):
        if self.gcoder.getInfillRatio() == 0:
            return



        self.gcoder.addGcode("; layer infill\n")


        newSliceSurface = rs.CopyObject(self.sliceSurface, (0, 0, float(self.fixedLayerHeight*index)))
        editPoints = rs.SurfaceEditPoints(newSliceSurface)

        rs.DeleteObject(newSliceSurface)

        #horizontal
        baseLine = rs.AddLine(editPoints[0], editPoints[1])
        baseVec = (editPoints[2][0]-editPoints[0][0], editPoints[2][1]-editPoints[0][1], editPoints[2][2]-editPoints[0][2])
        forNormalize = math.sqrt(baseVec[0]**2 + baseVec[1]**2 + baseVec[2]**2)
        baseVec = [i/forNormalize for i in baseVec]

        dist = rs.Distance(editPoints[0], editPoints[2])


        lines = []

        interval = self.gcoder.getExtruderDiameter() * (1.0 / (self.gcoder.getInfillRatio() / 100.0))
        #It needs to DEBUG
        #interval = self.gcoder.getLayerHeight() * 30

        #prepare horizontal lines

        flag = False

        for i in range(int(dist/interval + 1)):
            nextVec = [j*(interval*i) for j in baseVec]

            nextStartPoint = (editPoints[0][0]+nextVec[0], editPoints[0][1]+nextVec[1], editPoints[0][2]+nextVec[2])
            nextEndPoint = (editPoints[1][0]+nextVec[0], editPoints[1][1]+nextVec[1], editPoints[1][2]+nextVec[2])

            nextLine = rs.AddLine(nextStartPoint, nextEndPoint)

            if nextLine == None or intersectCurve == None:
                rs.DeleteObject(nextLine)
                rs.DeleteObject(baseLine)

                continue


            lines = (self.trim(nextLine, intersectCurve, 1))
            rs.DeleteObject(nextLine)

            if lines is None:
                continue

            if i%2 == 1:
                lines.reverse()


            for j in lines:
                startPoint = rs.CurveStartPoint(j)
                endPoint = rs.CurveEndPoint(j)


                if i%2 == 0:
                    if flag:
                        self.gcoder.calcEValue(rs.Distance(prePoint, startPoint))

                        #tmpText = "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(startPoint[0], startPoint[1], startPoint[2], self.gcoder.getEValue(), 1800)
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(startPoint[0], startPoint[1], startPoint[2], 1800)
                    else:
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(startPoint[0], startPoint[1], startPoint[2], 3600)
                        flag = True

                    self.gcoder.calcEValue(rs.Distance(startPoint, endPoint))
                    #tmpText += "G1 X" + str(endPoint[0]) + " Y" + str(endPoint[1]) + " Z" + str(endPoint[2]) + " E" + str(self.gcoder.getEValue()) + " F1800\n"
                    tmpText += "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(endPoint[0], endPoint[1], endPoint[2], self.gcoder.getEValue(), 1800)
                    prePoint = endPoint



                elif i%2 == 1:
                    if flag:
                        self.gcoder.calcEValue(rs.Distance(prePoint, endPoint))

                        #tmpText = "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(endPoint[0], endPoint[1], endPoint[2], self.gcoder.getEValue(), 1800)
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(endPoint[0], endPoint[1], endPoint[2], 3600)
                    else:
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(endPoint[0], endPoint[1], endPoint[2], 3600)
                        flag = True

                    self.gcoder.calcEValue(rs.Distance(endPoint, startPoint))
                    #tmpText += "G1 X" + str(startPoint[0]) + " Y" + str(startPoint[1]) + " Z" + str(startPoint[2]) + " E" + str(self.gcoder.getEValue()) + " F1800\n"
                    tmpText += "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(startPoint[0], startPoint[1], startPoint[2], self.gcoder.getEValue(), 1800)

                    prePoint = startPoint



                self.gcoder.addGcode(tmpText)

            rs.DeleteObjects(lines)
        rs.DeleteObject(baseLine)




        """
        '''
        in case there is paralell curve
        '''
        if paralellOffset is not None:
            newLines  = []

            for toTrim in lines:
                trimedLines = self.trim(toTrim, paralellOffset, 2)
                if trimedLines == None:
                    continue
                for hoge in trimedLines:
                    newLines.append(hoge)

            lines = newLines
        """


        """

        for i in range(len(lines)):
            startPoint = rs.CurveStartPoint(lines[i])
            endPoint = rs.CurveEndPoint(lines[i])

            self.gcoder.calcEValue(rs.Distance(startPoint, endPoint))

            if i%2 == 0:
                tmpText = "G1 X" + str(startPoint[0]) + " Y" + str(startPoint[1]) + " Z" + str(startPoint[2]) + " F3600\n"
                tmpText += "G1 X" + str(endPoint[0]) + " Y" + str(endPoint[1]) + " Z" + str(endPoint[2]) + " E" + str(self.gcoder.getEValue()) + " F1800\n"

            elif i%2 == 1:
                tmpText = "G1 X" + str(endPoint[0]) + " Y" + str(endPoint[1]) + " Z" + str(endPoint[2]) + " F3600\n"
                tmpText += "G1 X" + str(startPoint[0]) + " Y" + str(startPoint[1]) + " Z" + str(startPoint[2]) + " E" + str(self.gcoder.getEValue()) + " F1800\n"



            self.gcoder.addGcode(tmpText)
        """




        #vertical

        baseLine = rs.AddLine(editPoints[0], editPoints[2])
        baseVec = (editPoints[1][0]-editPoints[0][0], editPoints[1][1]-editPoints[0][1], editPoints[1][2]-editPoints[0][2])
        forNormalize = math.sqrt(baseVec[0]**2 + baseVec[1]**2 + baseVec[2]**2)
        baseVec = [i/forNormalize for i in baseVec]

        dist = rs.Distance(editPoints[0], editPoints[1])


        lines = []

        #interval = self.gcoder.getLayerHeight() * (1.0 / self.gcoder.getInfillRatio())

        flag = False
        #prepare horizontal lines
        for i in range(int(dist/interval + 1)):
            nextVec = [j*(interval*i) for j in baseVec]

            nextStartPoint = (editPoints[0][0]+nextVec[0], editPoints[0][1]+nextVec[1], editPoints[0][2]+nextVec[2])
            nextEndPoint = (editPoints[2][0]+nextVec[0], editPoints[2][1]+nextVec[1], editPoints[2][2]+nextVec[2])

            nextLine = rs.AddLine(nextStartPoint, nextEndPoint)

            if nextLine == None or intersectCurve == None:
                #print("hogehoge")
                rs.DeleteObject(baseLine)
                rs.DeleteObject(nextLine)
                continue


            lines = (self.trim(nextLine, intersectCurve, 1))
            rs.DeleteObject(nextLine)

            if lines is None:
                continue

            if i%2 == 1:
                lines.reverse()



            for j in lines:
                startPoint = rs.CurveStartPoint(j)
                endPoint = rs.CurveEndPoint(j)

                if i%2 == 0:
                    if flag:
                        self.gcoder.calcEValue(rs.Distance(prePoint, startPoint))
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(startPoint[0], startPoint[1], startPoint[2], 3600)
                    else:
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(startPoint[0], startPoint[1], startPoint[2], 3600)

                    self.gcoder.calcEValue(rs.Distance(startPoint, endPoint))
                    tmpText += "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(endPoint[0], endPoint[1], endPoint[2], self.gcoder.getEValue(), 1800)
                    prePoint = endPoint

                    flag = True


                elif i%2 == 1:
                    if flag:
                        self.gcoder.calcEValue(rs.Distance(prePoint, endPoint))

                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(endPoint[0], endPoint[1], endPoint[2], 1800)
                    else:
                        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(endPoint[0], endPoint[1], endPoint[2], 1800)

                    self.gcoder.calcEValue(rs.Distance(endPoint, startPoint))
                    tmpText += "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(startPoint[0], startPoint[1], startPoint[2], self.gcoder.getEValue(), 1800)

                    prePoint = startPoint

                    flag = True


                self.gcoder.addGcode(tmpText)

            rs.DeleteObjects(lines)


        rs.DeleteObject(baseLine)


        return



    def clean(self):

        rs.DeleteObject(self.sliceSurface)
        rs.DeleteObject(self.addtiveObj)
        return

    #setter orgnizer
    """
    def setPrintingSetting(self):

        #you wannt to import xml file or not?

        result = rs.MessageBox("Do you wish to import 'Print Setting File'?", 4, title="Import Print Setting")

        if result == 1:
            xmlFile = rs.OpenFileName("Select Print Setting File", "XML Files (*.xml)|*.xmx|All Files (*.*)|*.*||")
            self.printSetter.setFileName(xmlFile)
            self.printSetter.importPrintSetting()

        else:

            self.setExtruderDiameter()
            self.setFilamentDiameter()
            self.setExtrudeTemperture()

            self.setLayerHeight()
            self.setNumShellOutline()
            self.setNumTopLayer()
            self.setNumBottomLayer()
            self.setInfillRatio()

            exportOrNot = rs.MessageBox("Do you wish to export 'Print Setting File'?", 4, title="Export Print Setting")
            if result == 1:
                _fileName = rs.SaveFileName("Export Print Setting File", "XML Files (*.xml)|*.xml|All Files (*.*)|*.*||")
                self.printSetter.setFileName(_fileName)
                self.printSetter.exportPrintSetting()
    """

    def setPrintingSetting(self):
        self.setExtruderDiameter()
        self.setFilamentDiameter()
        self.setExtrudeTemperture()

        self.setLayerHeight()
        self.setNumShellOutline()
        self.setNumTopLayer()
        self.setNumBottomLayer()
        self.setInfillRatio()


    #setter

    def setExtruderDiameter(self):
        self.gcoder.setExtruderDiameter(rs.GetReal("Extruder Diameter", 0.4))

    def setFilamentDiameter(self):
        self.gcoder.setFilamentDiameter(rs.GetReal("Filament Diameter", 1.75))

    def setExtrudeTemperture(self):
        self.gcoder.setExtrudeTemperture(rs.GetReal("Extrude Temperture", 195))

    def setLayerHeight(self):
        self.gcoder.setLayerHeight(rs.GetReal("Layer Height", 0.15))

    def setNumShellOutline(self):
        self.gcoder.setNumShellOutline(int(rs.GetReal("Num of Shell Outline", 2)))


    def setNumTopLayer(self):
        self.gcoder.setNumTopLayer(int(rs.GetReal("Num of Top Layer", 2)))

    def setNumBottomLayer(self):
        self.gcoder.setNumBottomLayer(int(rs.GetReal("Num of Bottom Layer", 2)))

    def setInfillRatio(self):
        self.gcoder.setInfillRatio(rs.GetReal("Infill Ratio", 5))


"""


class printSettingOrganizer():

    def __init__(self, _gcoder):
        self.gcoder = _gcoder


    def setFileName(_fileName):
        self.fileName = _fileName

    def exportPrintSetting(self):
        tmpText = '<?xml version="1.0"?>'
        tmpText += "<printSetting>\n"

        tmpText += "\t<printerSetting>\n"
        tmpText += "\t\t<extruderTemperture>" + str(self.gcoder.getExtrudeTemperture()) + "</extrudeTemperture>\n"
        tmpText += "\t\t<filamentDiameter>" + str(self.gcoder.getFilamentDiameter()) + "</filamentDiameter>\n"
        tmpText += "\t\t<extruderDiameter>" + str(self.gcoder.getExtruderDiameter()) + "</extruderDiameter>\n"
        tmpText += "\t</printerSetting>\n"

        tmpText += "\t<sliceSetting>\n"
        tmpText += "\t\t<layerHeight>" + str(self.gcoder.getLayerHeight()) + "</layerHeight>\n"
        tmpText += "\t\t<shellOutline>" + str(self.gcdoer.getNumShellOutline()) + "</shellOutline>\n"
        tmpText += "\t\t<bottomLayer>" + str(self.gcoder.getNumBottomLayer()) + "</bottomLayer>\n"
        tmpText += "\t\t<topLayer>" + str(self.gcoder.getNumTopLayer()) + "</topLayer>\n"
        tmptext += "\t\t<infillRatio>" + str(self.gcoder.getInfillRatio()) + "</infillRatio>\n"
        tmpText += "\t</sliceSetting>\n"

        tmpText += "</printSetting>\n"


        with open(self.fileName, 'w') as w:
            w.writelines(tmpText)
            w.close()

        print("Print setting file is exported")

        return

    def importPrintSetting(self):
        tree = ET.parse(self.fileName)

        self.gcoder.setExtruderDiameter(int(tree.find('./printerSetting/extruderDiameter').text))
        self.gcoder.setFilamentDiameter(int(tree.find('./printerSetting/filamentDiameter').text))
        self.gcoder.setExtrudeTemperture(int(tree.find('./printerSetting/extrudeTemperture').text))

        self.gcoder.setLayerHeight(int(tree.find('./sliceSetting/layerHeight').text))
        self.gcoder.setInfillRatio(int(tree.find('./sliceSetting/infillRatio').text))
        self.gcoder.setNumShellOutline(int(tree.find('./sliceSetting/shellOutline').text))
        self.gcoder.setNumTopLayer(int(tree.find('./sliceSetting/topLayer').text))
        self.gcoder.setNumBottomLayer(int(tree.find('./sliceSetting/bottomLayer').text))

        print("Print Setting is imported")

        return
"""

class gcodeGenerater():

    def __init__(self):

        self.fileName = "testGcode.gcode"
        self.textGcode = ""

        self.layerHeight = 0.2
        self.extruderDiameter = 0.4
        self.filamentDiameter = 1.75
        self.extrudeTemperture = 210
        self.infillRatio = 0.02

        self.numBottomLayer = 2
        self.numTopLayer = 4
        self.numShellOutline = 3

        self.EValue = 0

        self.f = None



    def initGcode(self, fileN):
        self.textGcode = ""

        self.textGcode += "G90\n" # set to absolute positioning
        self.textGcode += "M82\n" # set extruder to absolute mode
        self.textGcode += "M106 S255\n" # fan on
        self.textGcode += "M104 S" + str(self.extrudeTemperture) + " T0\n" # set extruder temperture
        self.textGcode += "M109 S" + str(self.extrudeTemperture) + " T0\n" # set extruder temperture and wait
        self.textGcode += "G28\n" #go home

        self.textGcode += "G92 E0\n" # set position: E -> new extruder position
        self.textGcode += "G1 E-1.0000 F1800\n" # retract

        self.f = open(fileN, "w")
        self.f.writelines(self.textGcode)

    def addGcode(self, code):
        #self.textGcode += code
        self.f.writelines(code)

    def finishGcode(self):
        self.textGcode = "G92 E0\n"
        self.textGcode += "G1 E-1.0000 F18000\n"
        self.textGcode += "M104 S0\n"
        self.textGcode += "M140 S0\n"
        self.textGcode += "G28\n"
        self.textGcode += "M84\n"

        self.f.writelines(self.textGcode)

    def outputFile(self):
        '''
        with open(fileN, "w") as f:
            f.writelines(self.textGcode)
            f.close()
        '''

        self.f.close()
        print("Successfly gcode file is output")


    def calcEValue(self, dist):
        self.EValue += float(dist * self.getLayerHeight() * self.getExtruderDiameter()) / \
                        float(math.pi * (float(self.getFilamentDiameter()/2.0) ** 2))

    #setter
    def setFileName(self, _fileName):
        self.fileName = _fileName

    def setLayerHeight(self, _layerHeight):
        self.layerHeight = _layerHeight

    def setExtruderDiameter(self, _extruderDiameter):
        self.extruderDiameter = _extruderDiameter

    def setFilamentDiameter(self, _filamentDiameter):
        self.filamentDiameter = _filamentDiameter

    def setInfillRatio(self, _infillRatio):
        self.infillRatio = _infillRatio

    def setNumShellOutline(self, _numShellOutline):
        self.numShellOutline = _numShellOutline

    def setNumTopLayer(self, _numTopLayer):
        self.numTopLayer = _numTopLayer

    def setNumBottomLayer(self, _numBottomLayer):
        self.numBottomLayer = _numBottomLayer

    def initEValue(self):
        self.EValue = 0

    def setExtrudeTemperture(self, _extrudeTemperture):
        self.extrudeTemperture = _extrudeTemperture




    #getter
    def getLayerHeight(self):
        return self.layerHeight

    def getExtruderDiameter(self):
        return self.extruderDiameter

    def getFilamentDiameter(self):
        return self.filamentDiameter

    def getInfillRatio(self):
        return self.infillRatio

    def getNumShellOutline(self):
        return self.numShellOutline

    def getNumTopLayer(self):
        return self.numTopLayer

    def getNumBottomLayer(self):
        return self.numBottomLayer

    def getEValue(self):
        return self.EValue
    def getExtrudeTemperture(self):
        return self.extrudeTemperture

    def getFilamentDiameter(self):
        return self.filamentDiameter

    def getExtruderDiameter(self):
        return self.extruderDiameter


'''
main
'''

def main():

    gcoder = gcodeGenerater()
    #printSetter = printSettingOrganizer(gcoder)
    #aam = AAM_Planar(gcoder, printSetter)

    aam = AAM_Planar(gcoder)
    aam.main()

def RunCommand(is_interactive):
    main()

'''
if __name__ == "__main__":
    main()
'''
