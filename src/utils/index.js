import { Style, Fill, Stroke } from "ol/style";
export function getLayerByTitle({ map, title }) {
  /* 1、获取地图所有的图层 */
  let layers = map.getLayers().getArray();
  /* 2、过滤出title=image */
  let result = layers.find((item) => item.get("title") == title);
  /* 3、返回结果图层 */
  return result;
}

export function setPntStyle({
  radius = 15,
  fill = "red",
  stroke = "#333",
  width = 2,
}) {
  return new ol.style.Style({
    image: new ol.style.Circle({
      radius,
      fill: new ol.style.Fill({
        color: fill,
      }),
      stroke: new ol.style.Stroke({
        color: stroke,
        width,
      }),
    }),
  });
}
export function setLineStyle({ color = "#333", width = 2 }) {
  return new ol.style.Style({
    //边线颜色
    stroke: new ol.style.Stroke({
      color,
      width,
    }),
  });
}
export function setAreaStyle({
  fill = "rgba(33,33,33,0.5)",
  stroke = "#ff2d51",
  width = 1,
}) {
  return new Style({
    fill: new Fill({
      color: fill,
    }),
    stroke: new Stroke({
      color: stroke,
      width,
    }),
  });
}

function getCoordinate(feature) {
  return feature.getGeometry().getCoordinates();
}

function setMarkerStyle(src) {
  return new ol.style.Style({
    /**{olx.style.IconOptions}类型*/
    image: new ol.style.Icon({
      anchor: [0.5, 60],
      anchorOrigin: "top-right",
      anchorXUnits: "fraction",
      anchorYUnits: "pixels",
      offsetOrigin: "top-right",
      // offset:[0,10],
      //图标缩放比例
      scale: 0.75,
      //透明度
      opacity: 0.75,
      //图标的url
      src,
    }),
  });
}

/**
 * 敏感信息字符转换
 * @param {*} str 需要转换的字符串
 * @param {*} start 开始转换的位置
 * @param {*} end 结束转换的位置(默认值为0)
 * @param {*} symbol 替换使用的符号（默认是*）
 */
export function changeToStar(str, start, end = 0, symbol = "*") {
  if (!str) return;
  let len = str.length;
  let stars = "";
  for (let i = 0; i < len - start - end; i++) {
    stars += symbol;
  }
  str = str.substr(0, start) + stars + str.substr(len - end);
  return str;
}
