/**
 * @param {String} type ="Box"|"Square"|"Point"|"Polygon"
 * 
 * */
export function createDraw({
    source,
    type
}) {
    let geometryFunction = null;
    let maxPoints = null;
    if (type == "Box") {
        type = "LineString";
        geometryFunction = function (coordinates, geometry) {
            if (!geometry) {
                //多边形
                geometry = new ol.geom.Polygon(null)
            }
            var start = coordinates[0]
            var end = coordinates[1]
            geometry.setCoordinates([
                [start, [start[0], end[1]], end, [end[0], start[1]], start],
            ])
            return geometry
        }
        maxPoints = 2;
    } else if (type == "Square") {
        type = 'Circle';
        geometryFunction = ol.interaction.Draw.createRegularPolygon(4)
    }else if (type == "Polygon") {
        type = "Polygon";
    }
    let draw = new ol.interaction.Draw({
        // 在哪个画布上绘制
        source: source,
        type,
        geometryFunction,
        maxPoints
    })
    return draw;
}