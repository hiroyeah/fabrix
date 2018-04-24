import rhinoscriptsyntax as rs
import Rhino as rhino
from System.Drawing import Color
import math
#import gcodeGenerater

"""
To do

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

        self.prePoint = None
        self.angleOfBaseSurface = None

        self.basePointForPlane = None

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


        #set layer for sliced lines
        '''
        if rs.IsLayer("gcode_line"):
            pass
        else:
            rs.AddLayer("gcode_line", Color.Red, True, False, None)
        '''

        #self.setLayerFill()
        self.slice()

        self.clean()


    def setAngleOfBaseSurface(self):

        tmpVector = (0,0,1)
        self.angleOfSurface = rs.VectorAngle(tmpVector,self.normalVec)

        #for debug
        if self.angleOfSurface < 0 or self.angleOfSurface > 90:
            print('self.angleOfSurface is weird')



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



    def setSurfaceForSlicing(self):
        explodedSurfaces = None

        editPoint = []
        explodedSurfaces = rs.ExplodePolysurfaces(self.addtiveObj)
        for i in explodedSurfaces:
            tmp = rs.SurfaceEditPoints(i)
            for j in tmp:
                editPoint.append(j)

        rs.CullDuplicatePoints(editPoint)


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
        forDistance = []
        for i in range(len(editPoint)):
            if i == 0:
                forDistance.append(editPoint[0])
                forDistance.append(rs.DistanceToPlane(plane, editPoint[0]))
            else:
                tmpDistance = rs.DistanceToPlane(plane, editPoint[i])
                if tmpDistance > forDistance[1]:
                    forDistance[0] = editPoint[i]
                    forDistance[1] = tmpDistance

        self.distancePrinting = rs.DistanceToPlane(plane, forDistance[0])
        #adapt to Z Axis
        self.distancePrinting *= (1.0 / math.cos(math.radians(self.angleOfSurface)))

        if self.distancePrinting < 0:
            self.distancePrinting *= -1

        plane = rs.PlaneFromNormal(basePointForPlane, self.normalVec)

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

        self.sliceSurface = rs.AddEdgeSrf(lineForSur)

        #Delete lines used for making sliceSurface
        rs.DeleteObjects(lineForSur)
        rs.DeleteObjects(explodedSurfaces)






    def slice(self):

        print("Slicing starts")
        print("It may take a long time")
        deleteItem = []

        self.gcoder.initGcode()

        tmpText = ""

        multiplier = float(self.gcoder.getLayerHeight() * math.cos(math.radians(self.angleOfSurface)))

        print('multiplier')
        print(multiplier)

        #layer by layer
        layer = 0
        for layer in range(int(self.distancePrinting/multiplier)+1):
        #while(True):

            tmpText = "; layer " + str(layer) + "\n"
            #init evalue
            tmpText += "G92 E0\n"
            self.gcoder.addGcode(tmpText)
            self.gcoder.initEValue()

            nextVec = (0, 0, float(multiplier*layer))
            slicer = rs.CopyObject(self.sliceSurface, nextVec)

            slicedCurves = rs.IntersectBreps(self.addtiveObj, slicer)
            #deleteItem.append(slicedCurves)

            rs.DeleteObject(slicer)

            if slicedCurves == None:
                print('slicing done')
                self.gcoder.finishGcode()
                fileN = rs.SaveFileName("Output file", "G-Code Files (*.gcode)|*.gcode|All Files (*.*)|*.*|", None, self.fileName)
                self.gcoder.outputFile()

                return

            #slicedCurve one by one


            for slicedCurve in slicedCurves:

                self.makeGcodeFromSlicedCurve(slicedCurve, layer, nextVec, multiplier)


            layer += 1

            rs.DeleteObjects(slicedCurves)

        self.gcoder.finishGcode()
        fileN = rs.SaveFileName("Output file", "G-Code Files (*.gcode)|*.gcode|All Files (*.*)|*.*|")
        self.gcoder.outputFile(fileN)

        return True





    def makeGcodeFromSlicedCurve(self, slicedCurve, layer, vec, multiplier):
        deleteItem = []

        tmpText = ""

        editPointsOfIntersectCurve = rs.CurveEditPoints(slicedCurve)

        dirVec = [0,0,0]
        for l in editPointsOfIntersectCurve:
            dirVec[0] += l[0]
            dirVec[1] += l[1]
            dirVec[2] += l[2]

        dirVec = [i/len(editPointsOfIntersectCurve) for i in dirVec]

        #shell by shell
        for shell in range(self.gcoder.getNumShellOutline()):

            if shell == 0:
                offsetCurve = rs.CopyObject(slicedCurve)
            else:
                offsetCurve = rs.OffsetCurve(slicedCurve, tuple(dirVec), self.gcoder.getLayerHeight() * shell)

            #if offsetCurve == None or isinstance(offsetCurve, list) or not rs.IsCurveClosed(offsetCurve):
            #if offsetCurve == None or isinstance(offsetCurve, list):
            if offsetCurve == None:
                #print('failed to offset curve')
                continue

            if isinstance(offsetCurve, list) and len(offsetCurve) > 1:
                rs.DeleteObjects(offsetCurve)
                continue

            explodedCurve = rs.ExplodeCurves(offsetCurve)


            #lines from explodedCurve
            #from outline to gcode
            prePoint = None
            for line in range(len(explodedCurve)):

                startPoint = rs.CurveStartPoint(explodedCurve[line])
                endPoint = rs.CurveEndPoint(explodedCurve[line])

                if line == 0:
                    tmpText = "G1 X" + str(startPoint[0]) + " Y" + str(startPoint[1]) + " Z" + str(startPoint[2]) + " F3600\n"

                #self.gcoder.calcEValue(startPoint, endPoint)
                self.gcoder.calcEValue(rs.Distance(startPoint, endPoint))
                tmpText += "G1 X" + str(endPoint[0]) + " Y" + str(endPoint[1]) + " Z" + str(endPoint[2]) + " E" + str(self.gcoder.getEValue()) + " F1800\n"



            rs.DeleteObjects(explodedCurve)

            self.gcoder.addGcode(tmpText)


            #from outline to fill gocde
            #if shell is last one, it needs to fill layer or infill

            if shell == (self.gcoder.getNumShellOutline()-1):

                newOffsetCurve = rs.OffsetCurve(offsetCurve, tuple(dirVec), self.gcoder.getLayerHeight())

                if isinstance(newOffsetCurve, list) and len(newOffsetCurve) > 1:
                    continue


                if layer < (self.gcoder.getNumBottomLayer()):
                    self.setLayerFill(vec, newOffsetCurve, layer)

                elif layer > (int(self.distancePrinting/multiplier) - self.gcoder.getNumTopLayer()):

                    self.setLayerFill(vec, newOffsetCurve, layer)

                else:
                    self.setInfill(vec, newOffsetCurve)


                #rs.DeleteObjects(newOffsetCurve)


            rs.DeleteObjects(offsetCurve)
        rs.DeleteObject(slicedCurve)




    def setLayerFill(self, vec, intersectCurve, index):

        #set baseline, baseVec, dist
        newSliceSurface = rs.CopyObject(self.sliceSurface, vec)
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

        for i in range(int(dist/self.gcoder.getLayerHeight())+1):
            lines = []

            nextVec = [v*self.gcoder.getLayerHeight()*i for v in baseVec]

            #vertical
            if index%2 == 0:
                nextStartPoint = (editPoints[0][0]+nextVec[0], editPoints[0][1]+nextVec[1], editPoints[0][2]+nextVec[2])
                nextEndPoint = (editPoints[1][0]+nextVec[0], editPoints[1][1]+nextVec[1], editPoints[1][2]+nextVec[2])

            if index%2 == 1:
                nextStartPoint = (editPoints[0][0]+nextVec[0], editPoints[0][1]+nextVec[1], editPoints[0][2]+nextVec[2])
                nextEndPoint = (editPoints[2][0]+nextVec[0], editPoints[2][1]+nextVec[1], editPoints[2][2]+nextVec[2])

            #nextLine = (nextStartPoint), (nextEndPoint)
            nextLine = rs.AddLine(nextStartPoint, nextEndPoint)
            try:
                intersectedPoint = rs.CurveCurveIntersection(nextLine, intersectCurve[0])
            except:
                print("intersect failur")

                print('nextLine')
                print(nextLine)
                print('intersectCurve')
                print(intersectCurve)
                print(intersectCurve[0])


            if intersectedPoint == None:
                #print('intersectedPoint is none')
                rs.DeleteObject(nextLine)
                rs.DeleteObject(newSliceSurface)
                continue

            intersectedPoint = [n[1] for n in intersectedPoint]



            if len(intersectedPoint)%2 == 0:
                for j in range(int(len(intersectedPoint)/2)):
                    if i%2 == 0:
                        lines.append(rs.AddLine(intersectedPoint[2*j], intersectedPoint[(2*j)+1]))
                    else:
                        lines.append(rs.AddLine(intersectedPoint[2*int(len(intersectedPoint)/2-j)-1], intersectedPoint[2*int(len(intersectedPoint)/2-j)-2]))

            elif len(intersectedPoint)%2 == 1:
                #check there is no duplicate point with intersectCurve
                #DEBUG needs
                intersectedPoint = self.deleteAlonePoint(intersectedPoint, intersectCurve)

            rs.DeleteObject(nextLine)

            for j in lines:
                startPoint = rs.CurveStartPoint(j)
                endPoint = rs.CurveEndPoint(j)

                #self.gcoder.calcEValue(startPoint, endPoint)
                self.gcoder.calcEValue(rs.Distance(startPoint, endPoint))

                tmpText = "G1 X" + str(startPoint[0]) + " Y" + str(startPoint[1]) + " Z" + str(startPoint[2]) + " F3600\n"
                tmpText += "G1 X" + str(endPoint[0]) + " Y" + str(endPoint[1]) + " Z" + str(endPoint[2]) + " E" + str(self.gcoder.getEValue()) + " F1800\n"

                self.gcoder.addGcode(tmpText)


            rs.DeleteObjects(lines)

        rs.DeleteObject(newSliceSurface)

    def deleteAlonePoint(self, points, intersectCurve):
        editPoint = rs.CurveEditPoints(intersectCurve)

        for i in editPoint:

            for j in range(len(points)):

                if rs.Distance(i,points[j]) == 0.0:
                    points.pop(j)

        return points


    def setInfill(self, vec, intersectCurve):
        if self.gcoder.getInfillRatio() == 0:
            return

        newSliceSurface = rs.CopyObject(self.sliceSurface, vec)
        editPoints = rs.SurfaceEditPoints(newSliceSurface)

        rs.DeleteObject(newSliceSurface)

        #horizontal
        baseLine = rs.AddLine(editPoints[0], editPoints[1])
        baseVec = (editPoints[2][0]-editPoints[0][0], editPoints[2][1]-editPoints[0][1], editPoints[2][2]-editPoints[0][2])
        forNormalize = math.sqrt(baseVec[0]**2 + baseVec[1]**2 + baseVec[2]**2)
        baseVec = [i/forNormalize for i in baseVec]

        dist = rs.Distance(editPoints[0], editPoints[2])


        lines = []

        #interval = self.gcoder.getLayerHeight() * (1.0 / self.gcoder.getInfillRatio())
        interval = self.gcoder.getLayerHeight() * 30

        #prepare horizontal lines

        for i in range(int(dist/interval + 1)):
            nextVec = [j*(interval*i) for j in baseVec]

            nextStartPoint = (editPoints[0][0]+nextVec[0], editPoints[0][1]+nextVec[1], editPoints[0][2]+nextVec[2])
            nextEndPoint = (editPoints[1][0]+nextVec[0], editPoints[1][1]+nextVec[1], editPoints[1][2]+nextVec[2])

            nextLine = rs.AddLine(nextStartPoint, nextEndPoint)

            if nextLine == None or intersectCurve == None:
                '''
                print("hogehoge")
                print('nextLine')
                print(nextLine)
                print('intersectCurve')
                print(intersectCurve)
                '''
                continue
            try:
                intersectedPoint  = rs.CurveCurveIntersection(nextLine, intersectCurve)
            except:
                print('failed')
                print('nextLine')
                print(nextLine)
                print('intersectCurve')
                print(intersectCurve)


            if intersectedPoint == None:
                rs.DeleteObject(nextLine)
                continue

            intersectedPoint = [n[1] for n in intersectedPoint]



            if intersectedPoint == None:
                print('there is no intersectedPoint')
                rs.DeleteObject(nextLine)
                rs.DeleteObject(intersectedPoint)
                continue

            if len(intersectedPoint)%2 == 0:
                for j in range(int(len(intersectedPoint)/2)):
                    if i%2 == 0:
                        lines.append(rs.AddLine(intersectedPoint[2*j], intersectedPoint[(2*j)+1]))
                    else:
                        lines.append(rs.AddLine(intersectedPoint[2*int(len(intersectedPoint)/2-j)-1], intersectedPoint[2*int(len(intersectedPoint)/2-j)-2]))

            elif len(intersectedPoint)%2 == 1:
                #check there is no duplicate point with intersectCurve
                #DEBUG needs
                intersectedPoint = self.deleteAlonePoint(intersectedPoint, intersectCurve)

            rs.DeleteObject(nextLine)

        self.gcoder.addGcode("; layer infill\n")

        for i in range(len(lines)):
            startPoint = rs.CurveStartPoint(lines[i])
            endPoint = rs.CurveEndPoint(lines[i])

            #self.gcoder.calcEValue(startPoint, endPoint)
            self.gcoder.calcEValue(rs.Distance(startPoint, endPoint))


            #if i%2 == 0:
            tmpText = "G1 X" + str(startPoint[0]) + " Y" + str(startPoint[1]) + " Z" + str(startPoint[2]) + " F3600\n"
            tmpText += "G1 X" + str(endPoint[0]) + " Y" + str(endPoint[1]) + " Z" + str(endPoint[2]) + " E" + str(self.gcoder.getEValue()) + " F1800\n"


            self.gcoder.addGcode(tmpText)

        rs.DeleteObjects(lines)
        #rs.DeleteObject(baseLine)




        #vertical

        baseLine = rs.AddLine(editPoints[0], editPoints[2])
        baseVec = (editPoints[1][0]-editPoints[0][0], editPoints[1][1]-editPoints[0][1], editPoints[1][2]-editPoints[0][2])
        forNormalize = math.sqrt(baseVec[0]**2 + baseVec[1]**2 + baseVec[2]**2)
        baseVec = [i/forNormalize for i in baseVec]

        dist = rs.Distance(editPoints[0], editPoints[1])


        lines = []

        #interval = self.gcoder.getLayerHeight() * (1.0 / self.gcoder.getInfillRatio())

        #prepare horizontal lines
        for i in range(int(dist/interval + 1)):
            nextVec = [j*(interval*i) for j in baseVec]

            nextStartPoint = (editPoints[0][0]+nextVec[0], editPoints[0][1]+nextVec[1], editPoints[0][2]+nextVec[2])
            nextEndPoint = (editPoints[2][0]+nextVec[0], editPoints[2][1]+nextVec[1], editPoints[2][2]+nextVec[2])

            nextLine = rs.AddLine(nextStartPoint, nextEndPoint)

            if nextLine == None or intersectCurve == None:
                #print("hogehoge")
                continue

            intersectedPoint  = rs.CurveCurveIntersection(nextLine, intersectCurve)
            if intersectedPoint == None:
                #print('intersectedPoint is none')
                rs.DeleteObject(nextLine)
                continue

            intersectedPoint = [n[1] for n in intersectedPoint]


            if intersectedPoint == None:
                print('there is no intersectedPoint')
                rs.DeleteObject(nextLine)
                rs.DeleteObject(intersectedPoint)
                continue

            if len(intersectedPoint)%2 == 0:
                for j in range(int(len(intersectedPoint)/2)):
                    if i%2 == 0:
                        lines.append(rs.AddLine(intersectedPoint[2*j], intersectedPoint[(2*j)+1]))
                    else:
                        lines.append(rs.AddLine(intersectedPoint[2*int(len(intersectedPoint)/2-j)-1], intersectedPoint[2*int(len(intersectedPoint)/2-j)-2]))

            elif len(intersectedPoint)%2 == 1:
                #check there is no duplicate point with intersectCurve
                #DEBUG needs
                intersectedPoint = self.deleteAlonePoint(intersectedPoint, intersectCurve)

            rs.DeleteObject(nextLine)

        self.gcoder.addGcode("; layer infill\n")

        for i in range(len(lines)):
            startPoint = rs.CurveStartPoint(lines[i])
            endPoint = rs.CurveEndPoint(lines[i])

            #self.gcoder.calcEValue(startPoint, endPoint)
            self.gcoder.calcEValue(rs.Distance(startPoint ,endPoint))

            #if i%2 == 0:
            tmpText = "G1 X" + str(startPoint[0]) + " Y" + str(startPoint[1]) + " Z" + str(startPoint[2]) + " F3600\n"
            tmpText += "G1 X" + str(endPoint[0]) + " Y" + str(endPoint[1]) + " Z" + str(endPoint[2]) + " E" + str(self.gcoder.getEValue()) + " F1800\n"
            '''
            else:

                tmpText += "G1 X" + str(endPoint[0]) + " Y" + str(endPoint[1]) + " Z" + str(endPoint[2]) + " F3600\n"
                tmpText = "G1 X" + str(startPoint[0]) + " Y" + str(startPoint[1]) + " Z" + str(startPoint[2]) +" E" + str(self.gcoder.getEValue()) + " F1800\n"
            '''

            self.gcoder.addGcode(tmpText)

        rs.DeleteObjects(lines)
        #rs.DeleteObject(baseLine)


        return



    def clean(self):

        rs.DeleteObject(self.sliceSurface)
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



    def initGcode(self):
        self.textGcode = ""

        self.textGcode += "G90\n" # set to absolute positioning
        self.textGcode += "M82\n" # set extruder to absolute mode
        self.textGcode += "M106 S255\n" # fan on
        self.textGcode += "M104 S" + str(self.extrudeTemperture) + " T0\n" # set extruder temperture
        self.textGcode += "M109 S" + str(self.extrudeTemperture) + " T0\n" # set extruder temperture and wait
        self.textGcode += "G28\n" #go home

        self.textGcode += "G92 E0\n" # set position: E -> new extruder position
        self.textGcode += "G1 E-1.0000 F1800\n" # retract

    def addGcode(self, code):
        self.textGcode += code

    def finishGcode(self):
        self.textGcode += "G92 E0\n"
        self.textGcode += "G1 E-1.0000 F18000\n"
        self.textGcode += "M104 S0\n"
        self.textGcode += "M140 S0\n"
        self.textGcode += "G28\n"
        self.textGcode += "M84\n"

    def outputFile(self, fileN):
        with open(fileN, "w") as f:
            f.writelines(self.textGcode)
            f.close()

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


if __name__ == "__main__":
    main()
