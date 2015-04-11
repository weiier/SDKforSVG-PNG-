function Vmap( dom, mallId, floorId ) {
    //dom属性
    var dom = dom;
    var width = 700;//$(dom).width();
    var height = 650;//$(dom).height();
    //信息属性
    //商场ID
    var mallId = mallId;
    //服务器url
    var serverUrl = "";
    //商场名字
    var mallName = null;
    //当前的楼层ID
    var currentFloorId = null;
    
    //地图数据数据是否已经读取
    var isDataLoaded = false;
    //地图图片是否加载完成
    var isPicLoaded = false;
    //地图能否被更换
    var changeAble = true;
    //地图是否读取完成
    var isLoaded = false;
    //字体是否能被显示
    var isFontHide = false;
    //每层楼包含了多少张图片的信息，包括png 这条属性还有用么？
    var picPerFloor = 0;
    //楼层信息
    var floor = [];
    //地图信息
    var maps = [];
    //字体类型
    var fontType = {};
    //地图坐标转换 转换公式 当前地图上的位置 = 真实位置(数据服务器返回的位置)*rate/currentScale*zoomScale
    var rate = 96*1000/25.4
    //当前地图的scale值
    var currentScale = null;
    var publicSize = 13;
    var publicColor = "Brown";

    //位置相关属性
    //当前div位置
    var position = {
        x : 0,
        y : 0
    }
    //位置记录
    var cPosition = {
        x : 0,
        y : 0
    }
 
   
    //pinch标志位
    var pinchFlag = false;
    //缩放的动作 -1缩小 1放大
    var zoomAction = null;
    var publicCount = 0;

    //旋转初向量 
    var originVector = null;
    //旋转动作 左旋 右旋
    var rotateAction = null;
    //旋转标志位
    var rotateFlag = false;
   
    //当前的缩放等级
    var zoomScale = 1;
    //默认缩放变化
    var defaultDeltaScale = 0.03;
    //默认最小缩放等级
    var defaultMinScale = 0.5;
    //默认最大缩放等级
    var defaultMaxScale = 4.0;
    
    //公共设施的点
    var publicPlace = [];
    var unitFont = [];
    //当前的公共设施显示类型
    var currentPublicType = null;

    //覆盖物
    //点标记
    var markers = [];
    //线标
    var lines = [];
    //圆
    var circles = [];
    
    //callback函数指针
    this.onMapLoad = null;
    this.onDataLoad = null;
    this.onMapTap = null;
    this.onMapMoveStart = null;
    this.onMapMoveMove = null;
    this.onMapMoveEnd = null;
    this.onMapPinchStart = null;
    this.onMapPinchEnd = null;
    this.onFloorChange = null; 
    this.afterAddOverLay = null;
    this.afterRefreshOverLay = null;
    this.changePublicType = null;

    //保存this指针
    This = this;    
    
    //创建自己的div
    var floorDiv = document.createElement("div");
    floorDiv.style.position = "absolute";
    floorDiv.id = "floorDiv";  
    floorDiv.style.left = 0;
    floorDiv.style.top = 0;

    //创建自己的canvas
    var floorCanvas = document.createElement("canvas");
    floorCanvas.style.position = "absolute";
    floorCanvas.style.left = "0";
    floorCanvas.style.top = "0";
    floorCanvas.id = "floorCanvas";
    
    dom.appendChild(floorDiv);
    floorDiv.appendChild(floorCanvas);
    
    //获得context对象
    var context = floorCanvas.getContext("2d");
    
    //开始画图
    var floorImg = new Image();
    floorImg.onload = draw;
    changeBuild(mallId,floorId);
  
    function draw( event,type, color, normalSize ) {
        reAppend();
        drawMap(zoomScale);
        
        if ( !isFontHide ) {
            drawFont();
            drawUnitFont();
        }
        
        refreshOverLay();
        isPicLoaded = true;
    }

	function drawWithRotate(flag){
		publicCount = flag > 0 ? publicCount+1 : publicCount-1;
        floorDiv.style.webkitTransform="rotate(" + publicCount + "deg)";
		floorDiv.style.msTransform="rotate(" + publicCount + "deg)";
		floorDiv.style.MozTransform="rotate(" + publicCount + "deg)";
		floorDiv.style.OTransform="rotate(" + publicCount + "deg)";
		floorDiv.style.transform="rotate(" + publicCount + "deg)";
		drawMap(zoomScale);
        //selectFonts();
        drawFont();
            
        context.font = "20px Courier New";
        context.textAlign = "left";
        context.textBaseline ="top";
        context.fillStyle = "black";
        
        context.lineWidth = 3;
        context.strokeStyle = "blue";
        
        for ( var i in unitFont ) {
                if(unitFont[i].show == "1"){
                var FontX = unitFont[i].coord_x*rate/currentScale*zoomScale;
                var FontY = unitFont[i].coord_y*rate/currentScale*zoomScale;
                context.save();
                context.translate(FontX,FontY);
                context.rotate( -Math.PI * 1/180 * publicCount);
                context.fillText(unitFont[i].name,-unitFont[i].length/2,-10);
               // context.strokeRect(-unitFont[i].length/2,-10,unitFont[i].length,25);
                context.restore();
               
                }
                
        }
        refreshOverLay();
        isPicLoaded = true;
	}
    //绘图(callback)

    function drawUnitFont(){
        context.font = "20px CourierNew,Helvetica,Arial,sans-serif";
        context.textAlign = "left";
        context.textBaseline ="top";
        context.fillStyle = "red";
        
        context.lineWidth = 3;
        context.strokeStyle = "blue";
        
        var fontX = null;
        var fontY = null;
        zoomUnitFont();
        selectFonts();
        for ( var i in unitFont ) {
            if(unitFont[i].show == "1"){  
                fontX = unitFont[i].coord_x*rate/currentScale*zoomScale;
                fontY = unitFont[i].coord_y*rate/currentScale*zoomScale;
                context.save();
                context.translate(fontX,fontY);
                context.rotate( -Math.PI * 1/180 * publicCount);
                context.fillText(unitFont[i].name,-unitFont[i].length/2,-15);
                context.strokeRect(-unitFont[i].length/2,-15,unitFont[i].length,20);
                context.restore();
            }
        }
        
    }
    
    function drawFont( type, color, normalSize ) {
        var fColor = publicColor;
        var size = publicSize;
        if ( type ) {
            currentPublicType = type;
        }
        if ( currentPublicType === null ) {
            currentPublicType = "all";
        }
        if ( currentPublicType === "none" ) {
            return;
        }
        if ( !!color ) {
            fColor = color;
        }
        if ( !!normalSize ) {
            size = normalSize;
        }
        size = size*zoomScale;
        context.font = size+"px VMapPublic";
        context.textBaseline ="top";
        context.fillStyle = fColor;
        for ( var i in publicPlace ) {

            if ( ( ( currentPublicType === "all" ) || ( currentPublicType === publicPlace[i].unit_type_eng ) ) && ( publicPlace[i].floor_id === currentFloorId ) ) {                context.fillText(publicPlace[i].font,publicPlace[i].coord_x*rate/currentScale*zoomScale,publicPlace[i].coord_y*rate/currentScale*zoomScale);
            }
        }

    }
    //绘制地图
    function drawMap(zoom) {
        context.clearRect(0,0,floorCanvas.width,floorCanvas.height);
        floorCanvas.width = floorImg.width*zoom;
        floorCanvas.height = floorImg.height*zoom;
        context.drawImage(floorImg,0,0,floorImg.width*zoom,floorImg.height*zoom);
    }
    
    //切换楼层
    function changeFloor( floorId ) {
        
        getUnitFont(mallId,floorId,function() {
        });
        
        if ( changeAble === false ) {
            return false;
        }
        changeAble = false;
        if ( floorId === null ) {
            return false;
        }
        if ( typeof floorId === "number" ) {
            floorId = floor[floorId].floor_id;
        }
     
        isPicLoaded = false;
        var imgUrl = serverUrl;
        
        var floor_id = floorId.substring(5,floorId.length);
        $("#floor").text(floor_id);
       /**imgUrl = "http://123.57.46.160:8080/beacon/test!json?client=824&vkey=FFE58998-B203-B44E-A95B-8CA2D6CBCD65&floor="+floorId+"&place="+mallId+"&jsoncallback=?";*/
		  imgUrl = "http://10.103.242.71:8888/vmap/test!json?client=824&vkey=FFE58998-B203-B44E-A95B-8CA2D6CBCD65&floor="+floorId+"&place="+mallId+"&jsoncallback=?";
        $.getJSON( imgUrl,
                   function( result ) {
                       if ( true === result.success ) {
                           for ( var i = 0 ; i < floor.length; i++ ) {
                               if ( floor[i].floor_id == floorId ) {
                                   currentScale = floor[i].scale;
                                   break;
                               }
                           }
                           currentFloorId = floorId;
                           floorImg.src = result.data;
                           fontType = {};
                           for ( i in publicPlace ) {
                               if ( ( !fontType[publicPlace[i].unit_type_eng] ) && ( publicPlace[i].floor_id === currentFloorId ) ) {
                                   fontType[publicPlace[i].unit_type_eng] = 1;
                               }
                           }
                           bindEvent();
                           if ( This.onMapLoad != null ) {
                               This.onMapLoad(floorImg);
                           }
                           changeAble = true;
                           if ( This.onFloorChange != null ) {
                               This.onFloorChange();
                           }

                       } else {
                           alert("图片获取失败");
                           changeAble = true;
                       }
                   });
    }

    //切换建筑
    function changeBuild( uId, floorId ) {
        mallId = uId;
        if ( !floorId ) {
            floorId = null;
        }
        var dataUrl = serverUrl;
        dataUrl = "http://123.57.46.160:8080/beacon/place!all_in_one?client=824&&vkey=FFE58998-B203-B44E-A95B-8CA2D6CBCD65&place="+mallId+"&jsoncallback=?";
        $.getJSON( dataUrl,
                   function( result ) {
                       if ( true === result.success ) {
                           //填充数据
                           //获得当前商场的名字
                           mallName = result.place[0].name;
                           //获得当前商场每层楼对应多少张地图
                           picPerFloor = result.map[0].max_map_level;
                           var i = null;
                           var j = 0;
                           var now = 0;
                           //提取当前商场每层楼对应的svg图片信息（可能会导致picPerFloor没用了）
                           for ( i in result.map ) {
                               if ( result.map[i].style === "svg" ) {
                                   floor[j++] = result.map[i];
                                   if ( floorId === null ) {
                                       if ( result.map[i].floor_id === "Floor1" ) {
                                           now = j-1;
                                           floorId = "Floor1";
                                       } else {
                                           if ( result.map[i].floor_id === "Floor0" ) {
                                               now = j-1;
                                               floorId = "Floor0";
                                           }
                                       }
                                   } else {
                                       if ( result.map[i].floor_id === floorId ) {
                                           now = j-1;
                                       }
                                   }
                               }
                           }
                           currentScale = floor[now].scale;

                           //这里还没有填充楼层选择器！！
                           getPublicPlace(uId,"",
                                          function() {
                                              if ( !isLoaded ) {
                                                  isLoaded === true;
                                              }
                                             changeFloor(floorId);
                                          });
                           //如果有回调函数的话执行
                           if ( This.onDataLoad != null ) {
                               This.onDataLoad();
                           }
                       } else {
                           alert("获取楼层数据失败");
                       }
                   });
    }
    
    //内部函数
    //公共设施
    function getPublicPlace( uId, floorId,callback ) {
        var textUrl = "http://123.57.46.160:8080/beacon/place!facilities?client=824&vkey=FFE58998-B203-B44E-A95B-8CA2D6CBCD65&place="+uId;
        if ( !!floorId ) {
            textUrl += "&floor="+floorId;
        }
        textUrl += "&jsoncallback=?";
        $.getJSON(textUrl,
                  function (data) {
                      if ( !data.success ) {
                          alert("字体获取失败");
                          return;
                      }
                      publicPlace = data.rows;
                      if ( !!callback ) {
                          callback();
                      }
                  }
                 );
    }
    //字体
    function getUnitFont( uId, floorId,callback ) {
        var textUrl = "http://10.103.242.71:8888/vmap/spot!all?spot="+uId+"&floor="+floorId+"&jsoncallback=?";
        $.getJSON(textUrl,
                  function (data) {
                      if ( !data.success ) {
                          alert("UnitFont获取失败");
                          return;
                      }
                      var temp = data.rows;
                      var obj = {};
                      unitFont = [];
            for(var i in temp){
                obj = {};
                obj.name = temp[i].name;
                context.font = "20px Courier New";
                obj.length = context.measureText(temp[i].name).width;
                obj.coord_x = temp[i].coord_x;
                obj.coord_y = temp[i].coord_y;
                obj.show = 1;
                unitFont.push(obj);
            }
                      if ( !!callback ) {
                          callback();
                      }
                  }
                 );
    }
    //字体缩放
    function zoomUnitFont(){
        for(var i in unitFont ){
            unitFont[i].minX = unitFont[i].coord_x*rate/currentScale*zoomScale - unitFont[i].length/2;
            unitFont[i].maxX = unitFont[i].coord_x*rate/currentScale*zoomScale + unitFont[i].length/2;
            unitFont[i].minY = unitFont[i].coord_y*rate/currentScale*zoomScale - 10;
            unitFont[i].maxY = unitFont[i].coord_y*rate/currentScale*zoomScale + 10;
        }
    }
    
    //显示字体
    function selectFonts(){
        for(var i=0;i<unitFont.length;i++){
            unitFont[i].show = 1;
            var flag = true; 
            for(var j=i+1;j<unitFont.length;j++){
                
                if(unitFont[i].minX >= unitFont[j].minX && unitFont[i].minX <= unitFont[j].maxX
                   && unitFont[i].minY >= unitFont[j].minY && unitFont[i].minY <= unitFont[j].maxY){
                    flag = false;
                    unitFont[i].show = 0;
                }
                
                if(unitFont[i].minX >= unitFont[j].minX && unitFont[i].minX <= unitFont[j].maxX
                   && unitFont[i].maxY >= unitFont[j].minY && unitFont[i].maxY <= unitFont[j].maxY){
                    flag = false;
                    unitFont[i].show = 0;
                }
                
                if(unitFont[i].maxX >= unitFont[j].minX && unitFont[i].maxX <= unitFont[j].maxX
                   && unitFont[i].minY >= unitFont[j].minY && unitFont[i].minY <= unitFont[j].maxY){
                    flag = false;
                    unitFont[i].show = 0;
                }
                
                if(unitFont[i].maxX >= unitFont[j].minX && unitFont[i].maxX <= unitFont[j].maxX
                   && unitFont[i].maxY >= unitFont[j].minY && unitFont[i].maxY <= unitFont[j].maxY){
                    flag = false;
                    unitFont[i].show = 0;
                }
                
                if(!flag) break;
            }
        }
    }
    
    function degree( vectors )　{
        var v1 = vectors[0];
        var v2 = vectors[1];
        x = v1.pageX - v2.pageX;
        y = v1.pageY - v2.pageY;
        var result = {
            vectorsX:x,
            vectorsY:y
        }
        return result;
    }
    
    function xcheng( a, b){
        var result = 0;
        if(a.vectorsX*b.vectorsY - b.vectorsX*a.vectorsY > 0) {
            result = 1;
        }
        if(a.vectorsX*b.vectorsY - b.vectorsX*a.vectorsY < 0) {
            result = -1;
        }
        return result;
    }
    

    function rotateStart( event ) {
        if( originVector == null) {
            originVector = degree( event.pointers );
        }
        var currentVector = degree( event.pointers );
        var flag = xcheng(originVector,currentVector);
        if(flag == 0){
            return;
        }
        if(flag > 0 ){
            rotateAction = 1;
        }else if(flag < 0 ) {
            rotateAction = -1;
        }
        rotate(rotateAction);
        originVector = currentVector;
    }
    //对事件进行绑定
    function bindEvent() {
        var hammer = new Hammer(dom);
	    hammer.get('pinch').set({enable:true}); 
        //hammer.get('rotate').set({enable:true}); 

        hammer.on("panstart",function(ev){
            if(ev.pointers.length > 1){
                return false;
            }
            cPosition.x = ev.deltaX;
            cPosition.y = ev.deltaY;
            return false;
        });
        
        hammer.on("pan",function(ev){
            if(ev.pointers.length > 1){
                return false;
            }
            var dx = ev.deltaX - cPosition.x;
            var dy = ev.deltaY - cPosition.y;
            cPosition.x = ev.deltaX;
            cPosition.y = ev.deltaY;
            position.x += dx;
            position.y += dy;
            move( position.x, position.y );
        
            return false;
        });
        
        hammer.on("panend",function(ev){
            return false;
        });
        
         hammer.on("pinchstart",function(ev){
            drawMap(1);
            pinchFlag = true;
        });
        
        hammer.on("pinchin",function(ev){
            if(pinchFlag){
                zoomAction = {
                    x : ev.center.x - dom.offsetLeft,
                    y : ev.center.y - dom.offsetTop,
                    action : -1,
                }
                zoomToPoint(zoomAction);            
                return false;
            }
        });
        
        
        hammer.on("pinchout",function(ev){
            if(pinchFlag){
                 zoomAction = {
                    x : ev.center.x - dom.offsetLeft,
                    y : ev.center.y - dom.offsetTop,
                    action : 1,
                }

                zoomToPoint(zoomAction);
                return false;
            }
        });
    
        
        hammer.on("pinchend",function(ev){
            floorDiv.style.transform = "scale("+1+")";
            floorDiv.style.mozTransform = "scale("+1+")";
            floorDiv.style.webkitTransform = "scale("+1+")";
            floorDiv.style.oTransform = "scale("+1+")";

            draw();
            zoomAction = null;
            pinchFlag = false;
            return false;
        });
    
        
        hammer.on("rotatestart",function(ev){
        });
        
        hammer.on("rotatemove",function(ev){
        });
        
        hammer.on("rotateend",function(ev){
        });
        
        hammer.on("tap",function(ev){
             drawWithRotate(ev.rotation);
        });
    }
    
    //外部函数
	
	//放大
    function zoomIn() {
        var scale = zoomScale;
        if ( isPicLoaded == false ) {
            return false;
        }
        zoomScale += defaultDeltaScale;
        if ( zoomScale > defaultMaxScale ) {
            zoomScale = scale;
            alert('已经达到默认最大缩放等级');
            return false;
        }
        draw();
        event.preventDefault();//
        return false;
    }
    //缩小
    function zoomOut() {
        var scale = zoomScale;
        zoomScale -= defaultDeltaScale;
        if ( zoomScale < defaultMinScale ) {
            zoomScale = scale;
            alert("已经达到默认最小缩放等级");
            return false;
        }
        draw();
        event.preventDefault();//
        return false;
    }
    //以dom中心的坐标为中心放大
    function zoomInMid() {
        if ( zoomScale+defaultDeltaScale > defaultMaxScale ) {
            alert("已经达到最大缩放等级!");
            return false;
        }
        var point = { 
            x : width/2,
            y : height/2,
            action : 1
        }
        zoomToPoint( point );
        return false;
    }
    //以dom中心坐标为中心缩小
    function zoomOutMid() {
        if ( zoomScale-defaultDeltaScale < defaultMinScale ) {
            alert("已经达到最小缩放等级！");
            return false;
        }
        var point = { 
            x : width/2,
            y : height/2,
            action : -1
        }
        zoomToPoint( point );
        return false;
    }

    //以point为中心进行缩放，point.action为1时放大，point.action为-1时缩小；
    function zoomToPoint( point ) {
        if ( point == null ) {
            return;
        }
                
        var left = parseFloat(floorDiv.style.left);
        var top =  parseFloat(floorDiv.style.top);
        
        var midLeft = point.x - left;
        var midTop = point.y - top;
        midLeft /= zoomScale;
        midTop /= zoomScale;
        if ( point.action == -1 && zoomScale-defaultDeltaScale >= defaultMinScale ) {
            zoomScale -= defaultDeltaScale;
        }
        if ( point.action == 1 && zoomScale+defaultDeltaScale <= defaultMaxScale ) {
            zoomScale += defaultDeltaScale;
        }
        midLeft *= zoomScale;
        midTop *= zoomScale;
        position.x = point.x - midLeft;
        position.y =  point.y - midTop;
        move (position.x,position.y);

        floorDiv.style.transform = "scale("+zoomScale+")";
        floorDiv.style.mozTransform = "scale("+zoomScale+")";
        floorDiv.style.webkitTransform = "scale("+zoomScale+")";
        floorDiv.style.oTransform = "scale("+zoomScale+")";
   
    }

    //平移
    function move( x, y ) {
        reAppend();
        floorDiv.style.left = x+"px";
        floorDiv.style.top = y+"px";
        return false;
    }
    //绝对值移动
    function Center( x, y ) {
        var newLeft = width - x*zoomScale;
        var newTop = height - y*zoomScale;
        move(newLeft,newTop);
    }

    //解决幻象bug
    function reAppend() {
        var $floorDiv = $(floorDiv).detach();
        $(dom).append($floorDiv);
    }
    
    //添加覆盖物哦~
    function addOverlay( obj ) {
        var delta = rate/currentScale*zoomScale;
  
        if ( obj.type() === "marker" ) {
            markers[markers.length] = obj;
            var point = obj.point();
            $(obj.dom).css({
                left : point.x*delta+"px",
                top : point.y*delta+ 10 + "px"
            });
            if ( obj.floorIndex() !== currentFloorId ){
                obj.hide();
            }
            floorDiv.appendChild(obj.dom);
        }
        
        if ( obj.type() === "line" ) {

            lines[lines.length] = obj;
            var points = obj.points();
            if ( isPicLoaded === true ) {
                context.beginPath();
                var l = points.length;
                var color = obj.color();
                var width = obj.width();
                context.lineCap = "round";
                context.lineWidth = width;
                context.strokeStyle = color;
                for ( var i = 0; i <= l-2; i++ ) {
                    if ( ( points[i].floorIndex === currentFloorId ) && ( points[i+1].floorIndex === currentFloorId ) )  {
                        context.moveTo(points[i].x*delta,points[i].y*delta);
                        context.lineTo(points[i+1].x*delta,points[i+1].y*delta);
                    }
                }
                context.stroke();
            }
        }
        
        if ( obj.type() === "circle" ) {

            circles[circles.length] = obj;
            var point = obj.point();
            var radius = obj.radius();
            if( isPicLoaded === true ) {
                context.beginPath();
                var color = obj.color();
                var width = obj.width();
                context.lineCap = "round";
                context.lineWidth = width;
                context.strokeStyle = color;
                if( point.floorIndex === currentFloorId ) {
                    context.arc(point.x*delta,point.y*delta,radius*delta,0,2 * Math.PI);
                    context.stroke();
                }
            }
        }
        
        if ( This.afterAddOverLay !== null ) {
            This.afterAddOverLay();
        }
    }

    function refreshOverLay() {
        var delta = rate/currentScale*zoomScale;
        for ( var i = 0 ; i < markers.length; i++ ) {
            var mark = markers[i];
            var p = mark.point();
            $(mark.dom).css({
                left : p.x*delta+"px",
                top : p.y*delta + "px"
            });
            if ( mark.floorIndex() !== currentFloorId ) {
                mark.hide();
            } else {
                mark.show();
            }
        }
        
        for ( var i = 0 ; i < lines.length; i++ ) {
            var points = lines[i].points();
            if ( isPicLoaded === true ) {
                context.beginPath();
                var l = points.length;
                var color = lines[i].color();
                var width = lines[i].width();
                context.lineCap = "round";
                context.lineWidth = width;
                context.strokeStyle = color;
                for ( var j = 0; j <= l-2; j++ ) {
                    if ( ( points[j].floorIndex === currentFloorId ) && ( points[j+1].floorIndex === currentFloorId ) )  {
                        context.moveTo(points[j].x*delta,points[j].y*delta);
                        context.lineTo(points[j+1].x*delta,points[j+1].y*delta);
                    }
                }
                context.stroke();
            }
        }
        
        
        for ( var i = 0 ; i < circles.length; i++ ) {
            var point = circles[i].point();
            var radius = circles[i].radius();
            if ( isPicLoaded === true ) {
               context.beginPath();
                var color = circles[i].color();
                var width = circles[i].width();
                context.lineCap = "round";
                context.lineWidth = width;
                context.strokeStyle = color;
                if( point.floorIndex === currentFloorId ) {
                    context.arc(point.x*delta,point.y*delta,radius*delta,0,2 * Math.PI);
                    context.stroke();
                }
            }
        }
        
        if ( This.afterRefreshOverLay !== null ) {
            This.afterRefreshOverLay();
        }
    }
    
    //清除覆盖物
    function clearOverlays() {
        for ( var i = 0; i < markers.length; i++ ) {
            $(markers[i].dom).remove();
        }
        markers = [];
        lines = [];
        circles = [];
        context.clearRect(0,0,floorCanvas.width,floorCanvas.height);
        reAppend();
        draw();
    }

    function getRealPoint( p ) {
        var delta = rate/currentScale*zoomScale;
        return {
            x : p.x/delta,
            y :p.y/delta,
            floorIndex : p.floorIndex
        };
    }
    function transform( p ) {
        var delta = rate/currentScale*zoomScale;
        return {
            x : p.x*delta,
            y :p.y*delta,
            floorIndex : p.floorIndex
        };
    }


    //上下楼的接口
    this.prevFloor = function () {
        var next = null;
        for ( var i = 0; i < floor.length; i++ ) {
            if ( floor[i].floor_id === currentFloorId ) {
                if ( i === 0 ) {
                    return false;
                }
                next = floor[i-1].floor_id;
                break;
            }
        }
        changeFloor(next);

    }

    this.nextFloor = function() {
        var next = null;
        for ( var i = 0; i < floor.length; i++ ) {
            if ( floor[i].floor_id === currentFloorId ) {
                if ( i === floor.length-1 ) {
                    return false;
                }
                next = floor[i+1].floor_id;
                break;
            }
        }
        changeFloor(next);
        
    }
    
    function getFontType() {
        var result = [];
        for ( i in fontType ) {
            result[result.length] = i;
        }
        return result;
    }

        //更换当前的公共设施显示
    function changePublicType( type ) {
        draw(null,type);
    }


    //将指针绑定为内部函数
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.zoomInMid = zoomInMid;
    this.zoomOutMid = zoomOutMid;
    this.addOverlay = addOverlay;
    this.clearOverlays = clearOverlays;
    this.refreshOverLay = refreshOverLay;
    this.changeFloor = changeFloor;
    this.changeBuild = changeBuild;
    this.getFontType = getFontType;
    this.changePublicType = changePublicType;
    this.transform = transform;
    this.getRealPoint = getRealPoint;

    //补充接口
    //整个数据结构是否初始化完成
    this.isLoaded = function () {
        return isLoaded;
    }
    //获得楼层的id
    this.getMallId = function() {
        return mallId;
    }
    this.getMallName = function() {
        return mallName;
    }
    //获得当前楼层id
    this.getCurrentFloorId = function() {
        return currentFloorId;
    }
    //获得最大楼层的id
    this.getMaxFloorId = function() {
        return floor[floor.length-1].floor_id;
    }
   
    this.getZoomScale = function() {
        return zoomScale;
    }
    this.getMapWidth = function() {
        return floorImg.width*zoomScale;
    }
    
    
}
