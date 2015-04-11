function VPoint( x, y, floorIndex ) {
    this.x = parseInt( x * 1000 ) / 1000;
    this.y = parseInt( y * 1000 ) / 1000;
    this.floorIndex = floorIndex;
}

function VPosition( left, top ) {
    this.left = left;
    this.top = top;
}

function Vsize( width, height ) {
    this.width = width;
    this.height = height;
}

function VNavigationControl( position ) {
    //�����ʾ5��
    var defaultMaxFloor = 5;
    //ÿ��¥��Ĭ�ϴ�С
    var defaultFloorWidth = 25;
    //СԲȦ����ƫ����
    var circleDeltaTop = 4;
    var liIdsuffix = "thfloor";

    //��ǰ���в�
    var currentMidFloor = null;
    var changeAble = true;
    //�������������Ƿ���Ч
    var upButtonValid = true;
    var downButtonValid =true;
    //¥����
    var maxFloor = null;
    var hidden = false;
    //����ָ��
    //�л�¥��
    this.changeFloor = null;
    this.show = null;
    this.hide = null;
    this.isHidden = null;
    //�����Լ�
    var This = this;
    //�ƶ����м�
    this.getMid = null;


    if ( !position ) {
        position = { 
            left : "50px",
            top : "50px"
        }
    } 
    //����
    var navigator = document.createElement("div");
    navigator.id = "floorNavigation";
    $(navigator).css({
        position : "absolute",
        width : defaultFloorWidth+"px",
        left : position.left,
        top : position.top,
        "z-index" : "10000"
    });
    
    //�ڿ�����ur
    var navigatorInner = document.createElement("div");
    navigatorInner.id = "navigatorInner";
    $(navigatorInner).css({
        position : "absolute",
        width : defaultFloorWidth+"px",
        top : defaultFloorWidth+"px",
        overflow : "hidden",
        cursor : "auto"
    });
    //���ϰ�ť
    var upButton = document.createElement("div");
    upButton.id = "upButton";
    $(upButton).css({
        position : "absolute",
        width : defaultFloorWidth+"px",
        height : defaultFloorWidth+"px",
        top : 0,
        background : "url(./zoom_ico.gif) -1px -56px no-repeat",
        "border-bottom" : "2px solid white",
        cursor : "pointer"
    });
    
    //���°�ť
    var downButton = document.createElement("div");
    $(downButton).css({
        position : "absolute",
        width : defaultFloorWidth+"px",
        height : defaultFloorWidth+"px",
        background : "url(./zoom_ico.gif) -2px -86px no-repeat",
        "border-top" : "2px solid white",
        cursor : "pointer"
    });
    //͸����СԲȦ
    var circle = document.createElement("div");
    circle.id = "circle";
    $(circle).css({
        position : "absolute",
        left : "2px",
        width : defaultFloorWidth+"px",
        height : defaultFloorWidth+"px",
        background : "url(./circle.png) -0.5px 0px no-repeat",
        cursor : "pointer",
        opacity : 0.7,
    });
    
    //¥����б�
    var floorList = document.createElement("ul");
    floorList.id = "floorList";


    //��䵼����
    function fillNavigator( floors ) {
        var i = 0;
        maxFloor = floors.length-1;
        //��̬��ȡ��ʾ���ٸ�¥��
        var show = defaultMaxFloor;
        for ( i = maxFloor; i >= 0; i-- ) {
            //����liԪ��
            var liItem = document.createElement("li");
            $(liItem).css({
                "width" : "25px",
                "height" : "25px",
                "margin" : "0 0 0 0",
                "text-align" : "center",
                });
            liItem.id = (i)+liIdsuffix;
            //liԪ����ʾ������
            var str = floors[i].floor_brief;
            var innerStr = "";
            if ( "B" == str[0] ) {
                innerStr ="-" ;
            }
            innerStr += str.slice(1);
            $(liItem).text(innerStr);
            //��p��li�ҵ��ְ�
            floorList.appendChild(liItem);
        }
        //�ж��ж��ٲ�¥��ʾ���ٲ�¥
        if ( maxFloor < show ) {
            show = maxFloor;
        }
        //��ȡ��ǰ¥��ֵ
        currentMidFloor = maxFloor - parseInt(show/2);
        //�ҵ�navigator�ĸ߶Ⱥ��ڿ�ĸ߶�
        // console.log("s "+currentMidFloor);
        navigatorInner.style.height = (show*defaultFloorWidth)+"px";
        navigator.style.height = ((show+2)*defaultFloorWidth)+"px";
        //�ҵ�list��navigator���ڿ�İְ�
        navigatorInner.appendChild(floorList);
        navigator.appendChild(upButton);
        navigator.appendChild(navigatorInner);
        //�ҵ���ť�µ�λ�ò��ҵ���İְ�
        $(downButton).css("top",(show+1)*defaultFloorWidth+"px");
        navigator.appendChild(downButton);
        //�ҵ�СԲȦ��λ�ò������ҵ��ְ�
        $(circle).css("top",((parseInt(show/2)+1)*defaultFloorWidth+circleDeltaTop)+"px");
        navigator.appendChild(circle);
        //��Ӷ���
        document.getElementById("map").appendChild(navigator);
        //�ҵ���ǰ��¥�㲢�ı�����ɫ
        str = "#"+currentMidFloor+liIdsuffix;
        $(str).css({
            "color":"black"
                   });
    }
    
    //�����¼�
    function listClick(event) {
        var floor = parseInt(event.target.id);
        if ( isNaN(floor) ) {
            return false;
        }
        getMid(floor);
        event.preventDefault();
    }
    
    //�ƶ����м俩(deltaΪtrue��ʱ��������ƶ� ����ȫ��Ϊ����ƶ�)
    function getMid(n,delta) {
        if ( changeAble === false ) {
            return false;
        }
        changeAble ===true;
        var c = null;
        var save = currentMidFloor;
        var circleTop = parseInt($(circle).css("top"));
        n = parseInt(n);
        if ( delta !== true  ) {
            c = n - currentMidFloor;
            currentMidFloor = n;
            
        } else {
            c = n;
            currentMidFloor += n;
        }
        if ( ( currentMidFloor < 0 ) || ( currentMidFloor > maxFloor ) ) {
            currentMidFloor = save;
            return false;
        }
        var deltaTop = c*defaultFloorWidth;
        deltaTop = "+="+deltaTop+"px";
        refreshFont();
        $(circle).css({
            "top" : ((-c)*defaultFloorWidth+circleTop)+"px"
        });
        $(floorList).animate({top:deltaTop},Math.abs(c)*120);
        $(circle).animate({top:circleTop},Math.abs(c)*120);
        updateValid();
        if ( This.changeFloor !== null ) {
            This.changeFloor(currentMidFloor);
        }
        changeAble === true;
        return false;
    }
    //����Ƿ�ﵽ���ϲ�
    function checkMaxFloor() {
        if ( currentMidFloor === maxFloor ) {
            if ( upButtonValid === true ) {
                upButtonValid = false;
                $(upButton).css("background","url(./zoom_ico.gif) -29px -56px no-repeat");
            }
        } else {
            if ( upButtonValid === false ) {
                upButtonValid = true;
                $(upButton).css("background","url(./zoom_ico.gif) -1px -56px no-repeat");
            }
        }
    }

    //����Ƿ�ﵽ���²�
    function checkMinFloor() {
        if ( currentMidFloor === 0 ) {
            if ( downButtonValid === true ) {
                downButtonValid = false;
                $(downButton).css("background","url(./zoom_ico.gif) -30px -86px no-repeat");
            }
        } else {
            if ( downButtonValid === false ) {
                downButtonValid = true;
                $(downButton).css("background","url(./zoom_ico.gif) -2px -86px no-repeat");
            }
        }
    }
    
    function refreshFont() {
        $("li").css({
            "color" : "white"
        });
        // console.log("!! "+currentMidFloor);
        var str = "#"+currentMidFloor+liIdsuffix;
        $(str).css({
            "color" : "black"
        });
    }
    

    //�������°�ť�Ƿ����
    function updateValid() {
        checkMaxFloor();
        checkMinFloor();
    }
    
    //��ɾ��ƫ�ƺ���
    function makefunction(x) {
        return function() {
            getMid(x,true);
        }
    }
    
    $(floorList).bind("click",listClick);
    $(upButton).bind("click",makefunction(1));
    $(downButton).bind("click",makefunction(-1));
    this.fillNavigator = fillNavigator;
    this.getMid = getMid;
    
    function hide( t ) {
        if ( t === null ) {
            t = 0;
        }
        $(navigator).hide(t,function(){
            hidden = true;
        });
    }
    function show( t ) {
        if ( t == null ) {
            t = 0;
        }
        $(navigator).show(t,function() {
            hidden = false;
        });
    }
    function isHidden() {
        return hidden;
    }
}

//��ǵ�
function VMarker( vpoint, pUrl, offset ){
    //Ĭ��ƫ��
    var defaultLeft = -26;
    var defaultTop = -50;
    //�Ƿ�Ϊ����
    var hidden = false;
    //����
    var type = "marker";
    //λ��
    var point = null;
    //����
    var url = pUrl;
    //�Ƿ���λ��
    if ( vpoint ) {
        point = vpoint;
    } else {
        return undefined;
    }
    // console.log("fk!");
    //����dom
    var marker = document.createElement("div");
    marker.style.position = "absolute";
    var img = document.createElement("img");
    img.style.position = "absolute";
    marker.appendChild(img);
    //ͼƬ��λ��
    if ( url ) {
        img.src = url;
    } else {
        img.src = _Vmapi_url+"/pop.png";
    }
    //����ͼƬ��ƫ����
    if ( offset ) {
        $img.css({
            left : offset.left+"px",
            top : offset.top+"px"
        })
    } else {
        $(img).css({
            left : defaultLeft+"px",
            top : defaultTop+"px"
        })
    }
    
    //����
    //����
    function hide( t ) {
        if ( t === null ) {
            t = 0;
        }
        $(marker).hide(t,function(){
            hidden = true; 
        })
    }
    //��ʾ
    function show( t ) {
        if ( t === null ) {
            t = 0;
        }
        $(marker).show(t, function(){
            hidden = false;
        })
    }
    function isHidden() {
        return hidden;
    }
    function getPosition() {
        return point;
    }
    
    function setPosition( p ) {
        $(marker).css({
            left : p.left+"px",
            top : p.top+"px"
        })
        point = p;
    }
    
    function getImgUrl() {
        return url;
    }

    function setImgUrl( newUrl ) {
        url = newUrl;
        img.src = url;
    }
    
    function getZIndex() {
        return $(marker).css("zIndex");
    }

    function setZIndex( zindex ) {
        $(marker).css( "zIndex", zindex );
    }

    //����ָ��ָ��
    this.show = show;
    this.hide = hide;
    this.isHidden = isHidden;
    this.getPosition = getPosition;
    this.setPosition = setPosition;
    this.getImgUrl = getImgUrl;
    this.setImgUrl = setImgUrl;
    this.getZIndex = getZIndex;
    this.setZIndex = setZIndex;
    this.type = function () {
        return type;
    }
    this.dom = marker;
    this.floorIndex = function() {
        return point.floorIndex;
    }
    this.point = function () {
        return point;
    }
    this.click = null;
    $(img).bind("click",this.click);
}

function VPolyline( vpoints, lineWidth, lineColor, lineId ) {
    var points = null;
    var floorIndex = null;
    var color = "red";
    var width = 10;
    var type = "line";
    var id = null;
    if ( vpoints === null ) {
        return undefined;
    } else {
        points = vpoints;
        floorIndex = points[0].floorIndex;
    }
    if ( lineWidth ) {
        width = lineWidth;
    }
    if ( lineColor ) {
        color = lineColor;
    }
    if ( lineId ) {
        id = lineId;
    }
    this.type = function () {
        return type;
    }
    this.color = function () {
        return color;
    }
    this.points = function () {
        return points;
    }
    this.floorIndex = function () {
        return floorIndex;
    }
    this.width = function () {
        return width;
    }
}

function VMarkertest1( vpoint, id, offset ){
    //Ĭ��ƫ��
    var defaultLeft = -26;
    var defaultTop = -50;
    //�Ƿ�Ϊ����
    var hidden = false;
    //����
    var type = "marker";
    //λ��
    var point = null;
    //����
    // var url = pUrl;
    //�Ƿ���λ��
    if ( vpoint ) {
        point = vpoint;
    } else {
        return undefined;
    }
    // console.log("fk!");
    //����dom
    var marker = document.createElement("div");
    marker.style.position = "absolute";
    var img = document.createElement("img");
    var message = document.createElement("div");
    img.style.position = "absolute";
    message.style.position = "absolute";
    marker.appendChild(img);
    marker.appendChild(message);
    //ͼƬ��λ��

    img.src = _Vmapi_url+"/pop.png";
    message.innerHTML=" <button onclick='showbeacon(\""+ id + "\")'>  查看</button> ";
    //����ͼƬ��ƫ����
    if ( offset ) {
        $img.css({
            left : offset.left+"px",
            top : offset.top+"px"
        })
        $message.css({
            left : offset.left+"px",
            top : offset.top+  50+"px",
            width:50+"px",
            height:30+"px",
            "text-align": "center"
        })
    } else {
        $(img).css({
            left : defaultLeft+"px",
            top : defaultTop+"px"
        })
        $(message).css({
            left : defaultLeft+"px",
            top : defaultTop+ 50 + "px",
            width:50+"px",
            height:30+"px",
            "text-align": "center"
        })
    }

    //����
    //����
    function hide( t ) {
        if ( t === null ) {
            t = 0;
        }
        $(marker).hide(t,function(){
            hidden = true;
        })
    }
    //��ʾ
    function show( t ) {
        if ( t === null ) {
            t = 0;
        }
        $(marker).show(t, function(){
            hidden = false;
        })
    }
    function isHidden() {
        return hidden;
    }
    function getPosition() {
        return point;
    }

    function setPosition( p ) {
        $(marker).css({
            left : p.left+"px",
            top : p.top+"px"
        })
        point = p;
    }

    function getImgUrl() {
        return url;
    }

    function setImgUrl( newUrl ) {
        url = newUrl;
        img.src = url;
    }

    function getZIndex() {
        return $(marker).css("zIndex");
    }

    function setZIndex( zindex ) {
        $(marker).css( "zIndex", zindex );
    }

    //����ָ��ָ��
    this.show = show;
    this.hide = hide;
    this.isHidden = isHidden;
    this.getPosition = getPosition;
    this.setPosition = setPosition;
    this.getImgUrl = getImgUrl;
    this.setImgUrl = setImgUrl;
    this.getZIndex = getZIndex;
    this.setZIndex = setZIndex;
    this.type = function () {
        return type;
    }
    this.dom = marker;
    this.floorIndex = function() {
        return point.floorIndex;
    }
    this.point = function () {
        return point;
    }
    this.click = null;
    $(img).bind("click",this.click);
}

function VMarkertest( vpoint, id, offset){
    //Ĭ��ƫ��
    var defaultLeft = -26;
    var defaultTop = -50;
    //�Ƿ�Ϊ����
    var hidden = false;
    //����
    var type = "marker";
    //λ��
    var point = null;
    //����
    // var url = pUrl;
    //�Ƿ���λ��
    if ( vpoint ) {
        point = vpoint;
    } else {
        return undefined;
    }
    // console.log("fk!");
    //����dom
    var marker = document.createElement("div");
    marker.style.position = "absolute";
    var img = document.createElement("img");
    var cirlce = document.createElement("canvas");
    var message = document.createElement("div");
    img.style.position = "absolute";
    message.style.position = "absolute";
    marker.appendChild(img);
    marker.appendChild(message);

    //ͼƬ��λ��
    img.src = _Vmapi_url+"/pop.png";
    message.innerHTML=" <button onclick='showbeacon(\""+ id + "\")'>  查看</button> ";

   // cirlce.style.position = "absolute";

    cirlce.style.background = "transparent";
    marker.appendChild(cirlce);

    var cxt=cirlce.getContext("2d");
    cxt.fillStyle="#ff000";
    cxt.beginPath();

    cxt.globalAlpha=0.5;
    cxt.arc(point.x ,point.y ,30*map.getZoomScale(),0,Math.PI*2,true);
    cxt.closePath();
    cxt.fill();

    //����ͼƬ��ƫ����
    if ( offset ) {

        $(img).css({
            left : offset.left+"px",
            top : offset.top+"px"

        })
        $(message).css({
            left : offset.left+"px",
            top : offset.top+  10 +"px",
            width:50+"px",
            height:30+"px",
            "text-align": "center"
        })



    } else {

        $(img).css({
            left: defaultLeft + "px",

            top: defaultTop + "px"
        })
        $(message).css({
            left: defaultLeft + "px",
            top: defaultTop + 10 + "px",
            width: 50 + "px",
            height: 30 + "px",
            "text-align": "center"
        })


    }

        //����
    //����
    function hide( t ) {
        if ( t === null ) {
            t = 0;
        }
        $(marker).hide(t,function(){
            hidden = true;
        })
    }
    //��ʾ
    function show( t ) {
        if ( t === null ) {
            t = 0;
        }
        $(marker).show(t, function(){
            hidden = false;
        })
    }
    function isHidden() {
        return hidden;
    }
    function getPosition() {
        return point;
    }

    function setPosition( p ) {
        $(marker).css({
            left : p.left+"px",
            top : p.top+"px"
        })
        point = p;
    }

    function getImgUrl() {
        return url;
    }

    function setImgUrl( newUrl ) {
        url = newUrl;
        img.src = url;
    }

    function getZIndex() {
        return $(marker).css("zIndex");
    }

    function setZIndex( zindex ) {
        $(marker).css( "zIndex", zindex );
    }

    //����ָ��ָ��
    this.show = show;
    this.hide = hide;
    this.isHidden = isHidden;
    this.getPosition = getPosition;
    this.setPosition = setPosition;
    this.getImgUrl = getImgUrl;
    this.setImgUrl = setImgUrl;
    this.getZIndex = getZIndex;
    this.setZIndex = setZIndex;
    this.type = function () {
        return type;
    }
    this.dom = marker;
    this.floorIndex = function() {
        return point.floorIndex;
    }
    this.point = function () {
        return point;
    }
    this.click = null;
   $(img).bind("click",this.click);
}

