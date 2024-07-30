// var gaode_vector = new ol.layer.Tile({
//   title: "vector",
//   source: new ol.source.XYZ({
//     url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}",
//     wrapX: false,
//     crossOrigin: "Anonymous"
//   }),
// });
// var gaode_image = new ol.layer.Tile({
//   title: "image",
//   source: new ol.source.XYZ({
//     url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}",
//     wrapX: false,
//     crossOrigin: "Anonymous"
//   }),
// });
let tdtKey = "744f11d29a0f287ab702a3f34002be3c";
 //初始化天地图矢量图层
 var layer_vec = new ol.layer.Tile({
  title: "天地图矢量图层",
  source: new ol.source.XYZ({
      url:
          "http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=" +
          tdtKey,
      crossOrigin: "anonymous",
      projection: "EPSG:4326",
      maxZoom: 18,
      minZoom: 1,
      wrapX: false,
  }),
});
//初始化天地图矢量注记图层
var layer_cva = new ol.layer.Tile({
  title: "天地图矢量注记图层",
  source: new ol.source.XYZ({
      url: "http://t{0-7}.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=" + tdtKey,
      crossOrigin: "anonymous",
      projection: "EPSG:4326",
      maxZoom: 18,
      minZoom: 1,
      wrapX: false,
  }),
});
//初始化天地图影像图层
var layer_img = new ol.layer.Tile({
  title: "天地图影像图层",
  source: new ol.source.XYZ({
      url: "http://t{0-7}.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=" + tdtKey,
      crossOrigin: "anonymous",
      projection: "EPSG:4326",
      maxZoom: 18,
      minZoom: 1,
      wrapX: false,
  }),
});
//初始化天地图影像注记图层
var layer_cia = new ol.layer.Tile({
  title: "天地图影像注记图层",
  source: new ol.source.XYZ({
      url: "http://t{0-7}.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=" + tdtKey,
      crossOrigin: "anonymous",
      projection: "EPSG:4326",
      maxZoom: 18,
      minZoom: 1,
      wrapX: false,
  }),
});
// 影像+注记图层组
var imgLayergroup = new ol.layer.Group({
  layers: [layer_img, layer_cia],
});
// 矢量+注记图层组
var vecLayergroup = new ol.layer.Group({
  layers: [layer_vec, layer_cva],
});

const docLayer = new Zondy.Map.Doc("", "guanggu", {
  // ip: "localhost",
  // port: 6163
  crossOrigin: "Anonymous"
});
// export { gaode_image, gaode_vector, docLayer };
export { imgLayergroup, vecLayergroup, docLayer };
