import {onMounted, ref, getCurrentInstance} from "vue";
import {setLineStyle, setPntStyle} from "@/utils/index.js";
import {setAnimateStyle} from "@/utils/setAnimateStyle.js";
import {setCanvasStyle} from "@/utils/setCanvasStyle.js";
import {createDraw} from "@/utils/createDraw.js";

export const toolLineHooks = ($map) => {

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
    let markLineLayer = new ol.layer.Vector({
        id:'markLineLayerId',
        source:markSource,
        style: txt_style,
        zIndex:99999
    })
    $map.addLayer(markLineLayer);


    ////////////////3、创建画布图层///////////////////
    /* 画布图层 -画笔 */
    let sourceLine = new ol.source.Vector({

    })
    let toolDrawLineLayer = new ol.layer.Vector({ //图层
        id:'drawlineLayerId',
        source: sourceLine, //资源
        style: setLineStyle({
            color: "rgba(0,208,169)",
            width: 8
        })
    })
    $map.addLayer(toolDrawLineLayer); //添加到地图

    // 禁用地图的双击放大功能
    $map.getInteractions().forEach(function(interaction) {
        if (interaction instanceof ol.interaction.DoubleClickZoom) {
            $map.removeInteraction(interaction);
        }
    });

    //绘制图形
    let toolDrawLine = new ol.interaction.Draw({
        type: "LineString",
        source: toolDrawLineLayer.getSource(),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue', // 设置线段颜色
                lineDash: [10, 5], // 设置虚线样式，数组中的数字分别代表实线部分长度和空白部分长度
                width: 4, // 设置线宽
            }),
        }),
    })

    /* 激活画笔 */
    const activeLineDraw = () => {
        $map.addInteraction(toolDrawLine);
    }

    /* 监听画笔 */
    toolDrawLine.on("drawend", evt => {
        let feature = evt.feature;
        let lineGeoJSON  = new ol.format.GeoJSON().writeFeatureObject(feature); // feature-geojson //绘制图形 转换geojson
        var length = turf.lineDistance(lineGeoJSON);//测量距离
        //设置标注内容
        txt_style.getText().setText(length.toFixed(2) + '千米')
        markSource.addFeature(feature)

    })

    const closeDraw=()=>{
        $map.removeInteraction(toolDrawLine)
    }

////////////////////////////////end//////////////////////////////////////

    return {sourceLine,activeLineDraw,closeDraw, toolDrawLine,toolDrawLineLayer,markLineLayer}
}