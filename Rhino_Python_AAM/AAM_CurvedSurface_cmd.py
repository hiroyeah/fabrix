import rhinoscriptsyntax as rs
import Rhino as rhino
from System.Drawing import Color
import math

__commandname__ = "AAM_CurvedSurface"


class AAM_CurvedSurface():

    def __init__(self, _gcoder):

        self.gcoder = _gcoder

        self.additiveObj = None
        #baseSurface includes sliceSurface
        self.contactSurface = None

        self.basePlanarSurface = None


        self.travelStartPoint = None

        return


    def main(self):

        #set Object that will be added
        if not self.setAdditiveObj():
            return 0
        print('setAdditiveObj done')

        #set Contact Surface that is used for slicing
        if not self.setContactSurface():
            return 0
        print('setContactSurface done')

        #set Planar Surface that is used for offset
        if not self.setPlanarBaseSurface():
            return 0
        print('setPlanarBaseSurface done')


        self.setPrintingSetting()



        fileN = rs.SaveFileName("Output file", "G-Code Files (*.gcode)|*.gcode|All Files (*.*)|*.*|")
        self.gcoder.initGcode(fileN)

        self.offsetItems()

        self.slice()

        self.gcoder.finishGcode()
        self.gcoder.outputFile()


        self.clean()

        return


    def setAdditiveObj(self):

        '''
        set object that is added
        when pick object, it must be mesh or polysurface
        if picked object is mesh, it will be converted to polysurface
        '''

        tmp = rs.GetObject("Pick a additive obj", rs.filter.polysurface | rs.filter.mesh)

        if rs.IsMesh(tmp):
            self.additiveObj = rs.MeshToNurb(tmp)

        elif rs.IsPolysurface(tmp):
            self.additiveObj = tmp

        else:
            print("Please select \"mesh\" or \"polysurface\"")
            return False

        return True

    def setContactSurface(self):
        '''
        set surface that is contact surface
        '''

        self.contactSurface = rs.GetObject("Select contact surface")
        print(self.contactSurface)
        #self.contactSurface = self.contactSurface[0]

        if self.contactSurface is None:
            print("Surface is not selected")
            return False

        else:
            return True

    def setPlanarBaseSurface(self):
        '''
        set surface that is planar surface
        this surface will be made from additiveObj
        this surface will be used in offsetNonPlanarSurface()
        '''

        explodedSurfaces = rs.ExplodePolysurfaces(self.additiveObj)
        editPoint = []

        if len(explodedSurfaces) is 0:

            meshed = rhino.Geometry.Mesh.CreateFromBrep(rs.coercebrep(self.additiveObj))
            editPoint = rs.MeshVertices(meshed[0])
        else:

            for i in explodedSurfaces:
                meshed = rhino.Geometry.Mesh.CreateFromBrep(rs.coercebrep(i))
                vertices = rs.MeshVertices(meshed[0])
                editPoint.extend(vertices)

        rs.DeleteObjects(explodedSurfaces)

        xValues = [i[0] for i in editPoint]
        yValues = [i[1] for i in editPoint]

        xValues.sort()
        yValues.sort()

        xMin = xValues[0]
        xMax = xValues[-1]
        yMin = yValues[0]
        yMax = yValues[-1]

        lineForSur = []
        lineForSur.append(rs.AddLine((xMin, yMin, 0), (xMax, yMin,0)))
        lineForSur.append(rs.AddLine((xMax, yMin,0), (xMax, yMax, 0)))
        lineForSur.append(rs.AddLine((xMax, yMax, 0), (xMin, yMax, 0)))
        lineForSur.append(rs.AddLine((xMin, yMax,0), (xMin, yMin, 0)))

        joinedCurve = rs.JoinCurves(lineForSur)
        rs.DeleteObjects(lineForSur)

        curveForSur = rs.OffsetCurve(joinedCurve, (0,0,1), 20)

        if len(curveForSur) > 1:
            curveForSur = rs.OffsetCurve(joinedCurve, (0,0,1), -20)

        self.basePlanarSurface = rs.AddPlanarSrf(curveForSur)
        rs.DeleteObjects(curveForSur)

        if self.basePlanarSurface is None:
            return False

        return True




    def offsetItems(self):
        self.additiveObj = rs.CopyObject(self.additiveObj, (0, 0, self.gcoder.getLayerHeight()*0.9))
        self.contactSurface = rs.CopyObject(self.contactSurface, (0, 0, self.gcoder.getLayerHeight()*0.9))

        return





    def slice(self):

        '''
        1. intersect with sliceSurface and additiveObj
        2. make shells(outline) from each intersected line
        [3-1. if bottom, make layer fill from intersected line]
        [3-2. if not bottom, make layer infill]
        '''

        layer = 0

        while True:


            tmpText = "; layer " + str(layer) + "\n"
            #tmpText += "G92 E0\n"
            self.gcoder.addGcode(tmpText)
            self.gcoder.initEValue()

            sliceSurface = rs.CopyObject(self.contactSurface, (0, 0, self.gcoder.getLayerHeight()*layer))

            #make intersected lines
            intersectedLines = rs.IntersectBreps(sliceSurface, self.additiveObj)

            if intersectedLines is None:
                #slice is done
                rs.DeleteObject(sliceSurface)
                print('slicing is done')
                return True


            #delete unClosed Line from intersectedLines
            cullIndex = []
            openCurves = []

            for i in range(len(intersectedLines)):
                if not rs.IsCurveClosed(intersectedLines[i]):
                    cullIndex.append(i)

            for i in range(len(cullIndex)):
                cullIndex[i] -= i

            for i in cullIndex:
                #rs.DeleteObject(intersectedLines[i])
                openCurves.append(intersectedLines[i])
                del intersectedLines[i]


            if layer == 0:
                self.travelStartPoint = (0, 0, 200)

            #make shell from outline
            for outline in intersectedLines:
                ##debug needs
                #tmpText = "G1 Z45 F3600\n"
                #self.gcoder.addGcode(tmpText)

                prePoint = None
                currentPoint = None

                convertedPolyline = rs.ConvertCurveToPolyline(outline)
                vertices = rs.CurveEditPoints(convertedPolyline)
                rs.DeleteObject(convertedPolyline)

                flag = True


                for ver in vertices:
                    currentPoint = ver

                    if flag:

                        if self.travelStartPoint is None:
                            print('travelStartPoint is None')
                        if currentPoint is None:
                            print('currentPoint is None')
                        travelResult = self.travel(self.travelStartPoint, currentPoint, sliceSurface)

                        if travelResult is False:
                            tmpText = "G92 E0\nG1 E-2 F3600\n"
                            tmpText += "G1 Z{0}\n".format(currentPoint[2] + 10)
                            tmpText += "G1 X{0} Y{1} Z{2}\n".format(currentPoint[0], currentPoint[1], currentPoint[2])
                            tmpText += "G1 E0\n"
                            self.gcoder.addGcode(tmpText)

                        flag = False

                        ##traveling end

                    else:
                        self.gcoder.calcEValue(rs.Distance(currentPoint, prePoint))
                        tmpText = "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(currentPoint[0], currentPoint[1], currentPoint[2], self.gcoder.getEValue(), 1800)

                        self.gcoder.addGcode(tmpText)

                    prePoint = currentPoint

                else:

                    self.travelStartPoint = currentPoint

                self.setLayerFill(outline, layer)

            '''
            for openCurve in openCurves:

                #self.gcoder.addGcode("G1 Z45 F3600\n")

                prePoint = None
                currentPoint = None

                convertedPolyline = rs.ConvertCurveToPolyline(openCurve)
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
            '''



            ##for zuhan
            #rs.DeleteObjects(intersectedLines)

            rs.DeleteObjects(openCurves)



            #make layer fill

            #make layer infil





            rs.DeleteObject(sliceSurface)

            layer += 1



        return True


    def travel(self, startPoint, endPoint, surfaceToProject):

        travelLine = rs.AddLine(startPoint, endPoint)

        projectedTravelLine = rs.ProjectCurveToSurface(travelLine, surfaceToProject, (0,0,1))
        rs.MoveObject(projectedTravelLine, (0, 0, self.gcoder.getLayerHeight()))
        try:
            convertedTravelPolyline = rs.ConvertCurveToPolyline(projectedTravelLine)
        except:
            print('In Trave, convertCurveToPolyline failed')
            print(projectedTravelLine)
            return False

        travelVertices = rs.CurveEditPoints(convertedTravelPolyline)
        rs.DeleteObject(convertedTravelPolyline)

        self.gcoder.addGcode("G92 E0\n")
        self.gcoder.initEValue()

        tmpText = "G1 E{0} F{1}\n".format(self.gcoder.getRetractionDistance(), 1800)
        self.gcoder.addGcode(tmpText)


        travelLineStartPoint = rs.CurveStartPoint(travelLine)
        projectedTravelLineStart = rs.CurveStartPoint(projectedTravelLine)
        projectedTravelLineEnd = rs.CurveEndPoint(projectedTravelLine)

        if rs.Distance(travelLineStartPoint, projectedTravelLineStart) > rs.Distance(travelLineStartPoint, projectedTravelLineEnd):
            travelVertices = list(travelVertices)
            travelVertices.reverse()

        rs.DeleteObject(travelLine)
        rs.DeleteObject(projectedTravelLine)


        for travelVer in travelVertices:
            tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(travelVer[0], travelVer[1], travelVer[2], 3600)
            self.gcoder.addGcode(tmpText)

        tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(endPoint[0], endPoint[1], endPoint[2], 3600)
        tmpText += "G1 E0.0 F1800\n"
        tmpText += "G92 E0\n"

        self.gcoder.addGcode(tmpText)



    def clean(self):

        rs.DeleteObject(self.basePlanarSurface)
        rs.DeleteObject(self.additiveObj)
        rs.DeleteObject(self.contactSurface)
        return


    def trim(self, curve, cutter):
        resultLines = []

        #when arguments are shit, return empty list
        try:
            rs.IsCurve(curve)
        except:
            ##Debug needs
            print('IsCurve failed')
            print(curve)
            return resultLines

        try:
            rs.IsCurve(cutter)
        except:
            ##Debug needs
            print('IsCurve failed')
            print(cutter)
            return resultLines

        if rs.IsCurve(curve) is False or rs.IsCurve(cutter) is False:
            return resultLines


        intersectedPoints = rs.CurveCurveIntersection(curve, cutter)
        if intersectedPoints == None:
            return resultLines

        #when cutter is not planar, tmpSurface will be non

        intersectedPoints = [n[1] for n in intersectedPoints]

        if len(intersectedPoints)%2 == 1:
            #print("In trim(), there is weird")
            return resultLines

        #convert point to curve parameter
        curveParas = []
        for i in intersectedPoints:
            curveParas.append(rs.CurveClosestPoint(curve, i))

        for i in range(int(len(curveParas)/2)):
            tmp = []
            tmp.append(curveParas[i*2])
            tmp.append(curveParas[i*2+1])

            try:
                resultLines.append(rs.TrimCurve(curve, tmp))
            except:
                return []
                ##debug needs
                """
                print('trim failed\ncurve,tmp,domain')
                print(curve)
                print(tmp)
                print(rs.IsCurve(curve))
                ##debug needs
                ##why this 'curve' isn't curve?
                if rs.IsCurve(curve):
                    print(rs.CurveDomain(curve))
                """


        return resultLines




    """
    offsetNotPlanarCurve() is offset command for nonPlanarCurve
    usually, it isn't able to offset nonPlanarCurve

    """
    def offsetNonPlanarCurve(self, curve, distance, layerIndex):

        """
        1. project curve to planarBaseSurface
        2. projected curve is planar, so it can be offset
        3. project offseted curve to contactSurface
        4. move projected curve to place should be, Z-Axis

        i guess that this procedure works
        Try it
        """


        return True

    def setLayerFill(self, outline, layerIndex):
        """
        1. make line from planarBaseSurface
        2. project that line to base surface
        3. trim projected line by curved surface
        4. move to place shoud be, Z-Axis
        """

        sliceSurface = rs.CopyObject(self.contactSurface, (0, 0, self.gcoder.getLayerHeight()*layerIndex))

        #make base fill line from outline
        convertedPolyline = rs.ConvertCurveToPolyline(outline)
        vertices = rs.CurveEditPoints(convertedPolyline)
        rs.DeleteObject(convertedPolyline)

        xValue = [i[0] for i in vertices]
        yValue = [i[1] for i in vertices]
        xValue.sort()
        yValue.sort()

        basePoint = []
        basePoint.append((xValue[0], yValue[0], 0))
        basePoint.append((xValue[-1], yValue[0], 0))
        basePoint.append((xValue[-1], yValue[-1], 0))
        basePoint.append((xValue[0], yValue[-1], 0))



        if layerIndex%2 == 0:

            baseLine = rs.AddLine(basePoint[0], basePoint[1])
            baseVec = (basePoint[3][0]-basePoint[0][0], basePoint[3][1]-basePoint[0][1], basePoint[3][2]-basePoint[0][2])
            dist = rs.Distance(basePoint[0], basePoint[3])

        elif layerIndex%2 == 1:
            baseLine = rs.AddLine(basePoint[0], basePoint[3])
            baseVec = (basePoint[1][0]-basePoint[0][0], basePoint[1][1]-basePoint[0][1], basePoint[1][2]-basePoint[0][2])
            dist = rs.Distance(basePoint[0], basePoint[1])


        forNormal = math.sqrt(baseVec[0]**2 + baseVec[1]**2 + baseVec[2]**2)
        baseVec = [i/forNormal for i in baseVec]


        self.gcoder.addGcode("; layer filling\n")

        #make gcode of layer filling
        for i in range(int(dist/self.gcoder.getExtruderDiameter())+1):
            liens = []

            nextVec = [v*self.gcoder.getExtruderDiameter()*i for v in baseVec]

            if layerIndex%2 == 0:
                nextStartPoint = (basePoint[0][0] + nextVec[0], basePoint[0][1]+nextVec[1], basePoint[0][2]+nextVec[2])
                nextEndPoint = (basePoint[1][0]+nextVec[0], basePoint[1][1]+nextVec[1], basePoint[1][2]+nextVec[2])

            elif layerIndex%2 == 1:
                nextStartPoint = (basePoint[0][0] + nextVec[0], basePoint[0][1]+nextVec[1], basePoint[0][2]+nextVec[2])
                nextEndPoint = (basePoint[3][0]+nextVec[0], basePoint[3][1]+nextVec[1], basePoint[3][2]+nextVec[2])

            nextLine = rs.AddLine(nextStartPoint, nextEndPoint)


            projectedLine = rs.ProjectCurveToSurface(nextLine, sliceSurface, (0,0,1))


            if projectedLine is None:
                rs.DeleteObject(nextLine)
                continue

            rs.DeleteObject(nextLine)


            trimedLine = self.trim(projectedLine, outline)

            if trimedLine is None or len(trimedLine) is 0:
                if projectedLine is not None:
                    try:
                        rs.DeleteObject(projectedLine)
                    except:
                        print('deleteObject failed')
                        print(projectedLine)
                continue

            rs.DeleteObject(projectedLine)



            if i%2 == 1:
                trimedLine.reverse()


            for j in trimedLine:
                prePoint = None
                currentPoint = None

                if j is None:
                    continue
                try:
                    convertedPolyline = rs.ConvertCurveToPolyline(j)
                except:
                    print("hoge")
                    print(j)

                vertices = rs.CurveEditPoints(convertedPolyline)
                rs.DeleteObject(convertedPolyline)

                flag = True

                if i%2 == 1:
                    vertices = list(vertices)
                    vertices.reverse()


                for ver in vertices:
                    currentPoint = ver
                    if flag:
                        self.travel(self.travelStartPoint, currentPoint, sliceSurface)
                        #tmpText = "G1 X{0} Y{1} Z{2} F{3}\n".format(currentPoint[0], currentPoint[1], currentPoint[2], 3600)
                        flag = False
                    else:
                        self.gcoder.calcEValue(rs.Distance(currentPoint, prePoint))
                        tmpText = "G1 X{0} Y{1} Z{2} E{3} F{4}\n".format(currentPoint[0], currentPoint[1], currentPoint[2], self.gcoder.getEValue(), 1800)
                        self.gcoder.addGcode(tmpText)

                    prePoint = currentPoint

                else:
                    self.travelStartPoint = currentPoint

            #bug
            if layerIndex != 0:
                if trimedLine is not None:
                    rs.DeleteObjects(trimedLine)



        rs.DeleteObject(sliceSurface)
        return


    def setPrintingSetting(self):
        self.setExtruderDiameter()
        self.setFilamentDiameter()
        self.setExtrudeTemperture()

        self.setLayerHeight()


    def setExtruderDiameter(self):
        self.gcoder.setExtruderDiameter(rs.GetReal("Extruder Diameter", 0.4))

    def setFilamentDiameter(self):
        self.gcoder.setFilamentDiameter(rs.GetReal("Filament Diameter", 1.75))

    def setExtrudeTemperture(self):
        self.gcoder.setExtrudeTemperture(rs.GetReal("Extrude Temperture", 195))

    def setLayerHeight(self):
        self.gcoder.setLayerHeight(rs.GetReal("Layer Height", 0.15))




###############################################


class gcodeGenerater():

    def __init__(self):

        self.fileName = "testGcode.gcode"
        self.textGcode = ""
        ##for zuhan
        #self.layerHeight = 0.15
        self.layerHeight = 0.8

        self.extruderDiameter = 0.4
        self.filamentDiameter = 1.75
        self.extrudeTemperture = 195
        self.infillRatio = 15

        self.numBottomLayer = 2
        self.numTopLayer = 4
        self.numShellOutline = 3

        self.EValue = 0

        self.retractionDistance = -3.0

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

    def setRetractionDistance(self, _retractionDistance):
        self.retractionDistance = _retractionDistance




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

    def getRetractionDistance(self):
        return self.retractionDistance



def main():
    gcoder = gcodeGenerater()

    aam = AAM_CurvedSurface(gcoder)

    aam.main()


def RunCommand(is_interactive):
    main()


'''
if __name__ == "__main__":
    main()
'''
