function asyncGetDocInfo(docName){

	var docCatalog = new Zondy.Catalog.MapDoc({
		//获取地图文档的名称
		docName:docName,
	});
	return new Promise((resolve)=>{
		docCatalog.getLayersInfo(data=>{
			resolve(data)
		})
	})
}
export {asyncGetDocInfo}