// 实时路况
import {onMounted, ref, getCurrentInstance} from "vue";
import {setLineStyle} from "@/utils/index.js";

export const roadConditionsHooks = (map) => {

    let $map = null;
    let draw = null;
    onMounted(() => {
        const {proxy} = getCurrentInstance(); //key-code
        // console.log(proxy, "proxy");
        $map = proxy.$map;

        // draw = createDraw({
        //     type: "Box",
        //     source,
        // });
    });


/////////////////////////////////////////////////////////////////
    let source = new ol.source.Vector({

    })
    //给数据加上id
    const layerRoad = new ol.layer.Vector({
        source,
        id:'highRoadLayers'
    })

    const service = {
        name: "guanggu",
        layerId: 1,
    };
    const queryByLayerId = ({service, success}) => {
        //1、初始化查询结构对象，设置查询结构包含几何信息
        var queryStruct = new Zondy.Service.QueryFeatureStruct();
        //是否包含几何图形信息
        queryStruct.IncludeGeometry = true;
        //是否包含属性信息
        queryStruct.IncludeAttribute = true;
        //是否包含图形显示参数
        queryStruct.IncludeWebGraphic = false;
        //2、指定查询规则
        var rule = new Zondy.Service.QueryFeatureRule({
            //是否将要素的可见性计算在内
            EnableDisplayCondition: false,
            //是否完全包含
            MustInside: false,
            //是否仅比较要素的外包矩形
            CompareRectOnly: false,
            //是否相交
            Intersect: true
        });
        //3、实例化查询参数对象
        var queryParam = new Zondy.Service.QueryParameter({
            resultFormat: "json",
            struct: queryStruct,
            rule: rule
        });
        /* 默认只能获取20条 */
        //设置查询分页号
        queryParam.pageIndex = 0;
        //设置查询要素数目
        queryParam.recordNumber = 100;
        var queryService = new Zondy.Service.QueryDocFeature(queryParam, service.name,
            service.layerId, {});
        //执行查询操作，querySuccess为查询回调函数
        queryService.query(onSuccess(success));
    }

    var features
    const onSuccess = (success) => {
        return function (data) {
            var format = new Zondy.Format.PolygonJSON();
            //将MapGIS要素JSON反序列化为ol.Feature类型数组
            features = format.read(data);//格式解析器（format）读取数据（data），read用于读取输入的原始数据（data）并进行解析
            // console.log(features,"123456")
            //success(features);
            // 将一个包含多个要素（Features）的数组 features 添加到名为 layerRoad 的图层的数据源中。
            layerRoad.getSource().addFeatures(features);
            showRoad()
            // console.log('features', features)
        }
    }
    const showRoad = () => {
        let features = source.getFeatures();
        // console.log(features)
        features.forEach(item => {
            let color = null;
            let flow = item.values_.values_.车流量
            console.log('flow',flow)
            if (flow > 1900) {
                color = "red"
            } else if (flow > 1600) {
                color = "yellow"
            } else if (flow > 1400) {
                color = "gray"
            } else if (flow > 1200) {
                color = "blue"
            } else if (flow > 800) {
                color = "black"
            } else {
                color = "green"
            }
            /* 3、根据flow值的不同设置不同的颜色 */
            item.setStyle(setLineStyle({
                color,
                width: 5
            }))
        })
    }

    queryByLayerId({service, onSuccess})


    map.addLayer(layerRoad);
//////////////////////////////////////////////////////////////////////

//layerRoad给数据加上id   showRoad车流量渲染  features获取道路小e  onSuccess进行渲染道路
    return {layerRoad,showRoad,features, queryByLayerId, onSuccess}
}