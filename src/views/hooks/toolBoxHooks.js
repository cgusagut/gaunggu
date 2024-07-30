import {onMounted, ref, getCurrentInstance} from "vue";
import {setAreaStyle, setLineStyle, setPntStyle} from "@/utils/index.js";
import {setAnimateStyle} from "@/utils/setAnimateStyle.js";
import {setCanvasStyle} from "@/utils/setCanvasStyle.js";
import {createDraw} from "@/utils/createDraw.js";

export const toolBoxHooks = ($map) => {

    onMounted(() => {
        console.log('$map-toolBoxHooks', $map)
    });


//////////////////////////////start///////////////////////////////////

    let markSource = new ol.source.Vector({

    })
    const txt_style = new ol.style.Style({
        text: new ol.style.Text({
            font: 'normal 18px 微软雅黑',
            text: "标注文字",
            fill: new ol.style.Fill({ color: '#333' }),
            stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 }), // 文本边框
            // backgroundFill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.5)' }), // 背景色
            // backgroundStroke: new ol.style.Stroke({ color: '#000000', width: 2 }), // 边框颜色和宽度
            // padding: [5, 5, 5, 5] // 内边距，保持文本与边框的距离
        }),
    })
    let markBoxLayer = new ol.layer.Vector({
        id:'markBoxLayerId',
        source:markSource,
        style: txt_style,
        zIndex:99999
    })
    $map.addLayer(markBoxLayer);



    ////////////////3、创建画布图层///////////////////
    /* 画布图层 -画笔 */
    let sourceBox = new ol.source.Vector({

    })
    let toolDrawBoxLayer = new ol.layer.Vector({
        id:'toolBoxDrawId',
        source:sourceBox,
        style: setAreaStyle({
            fill: "rgba(96,238,205,0.5)",
            stroke:"rgb(96,188,238)",
            width: 5
        })
    })
    $map.addLayer(toolDrawBoxLayer);


    // 禁用地图的双击放大功能
    $map.getInteractions().forEach(function(interaction) {
        if (interaction instanceof ol.interaction.DoubleClickZoom) {
            $map.removeInteraction(interaction);
        }
    });

    //绘制图形
    let toolDrawBox  = new ol.interaction.Draw({
        type: "Polygon",
        source: toolDrawBoxLayer.getSource()
    })

    /* 激活画笔 */
    const activeBoxDraw = () => {
        $map.addInteraction(toolDrawBox);
    }

    /* 监听画笔 */
    toolDrawBox.on("drawend", evt => {
        //$map.removeInteraction(toolDrawBox) //移除画笔
        let feature = evt.feature;
        console.log('feature',feature)

        //转换geojson
        let polygon = new ol.format.GeoJSON().writeFeatureObject(feature); // feature-geojson //绘制图形
        console.log('polygon',polygon)

        //测量面积
        var area = turf.area(polygon); //计算面积平方米

        //设置标注内容
        txt_style.getText().setText(area.toFixed(2) + '平方米')
        markSource.addFeature(feature)
    })

    const closeDraw=()=>{
        $map.removeInteraction(toolDrawBox)
    }


////////////////////////////////end//////////////////////////////////////

    return {sourceBox,activeBoxDraw,closeDraw,toolDrawBox, toolDrawBoxLayer,markBoxLayer}
}