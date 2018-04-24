import rhinoscriptsyntax as rs


__commandname__ = "makeSliceSurface"


def makeSliceSurface(surface, maxAngle):

    explodedSurfaces = rs.ExplodePolysurfaces(surface)

    newSurfaces = []
    rs.DeleteObject(surface)

    baseVec = (0,0,1)

    for i in explodedSurfaces:
        vec = rs.SurfaceNormal(i, [0,0])
        angle = rs.VectorAngle(baseVec, vec)

        if angle > maxAngle:
            rs.DeleteObject(i)
        else:
            newSurfaces.append(i)

    joinedSurface = rs.JoinSurfaces(newSurfaces)

    return joinedSurface



def main():
    surface = rs.GetObject("select surface")
    angle = rs.GetReal("max angle")
    makeSliceSurface(surface, angle)


def RunCommand(is_interactive):
    main()

'''
if __name__ == "__main__":
    main()
'''