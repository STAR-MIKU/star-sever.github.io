function changeShare(){
    $( "#share").toggle(); 
    $(".wxInfo").hide();
    $(".qqPage").hide();
};
function changeAge(){
    $(".ageword").toggle();
}
function changeqq(){
    console.log(7777)
    $(".qqPage").toggle();
    $(".wxInfo").hide();
}
var d1=document.getElementById("d1");
var all=document.getElementById("all");
  
all.onmousemove=function(e){
        d1.style.top = e.clientY + 'px';
        d1.style.left = e.clientX  + 'px';
        // d1.style.transform="translate(-50%,-50%)";
        if(e.target.dataset.mouse=="big"){
                
                d1.style.background=`#b55829 url(${e.target.dataset.img}) no-repeat center`;
                d1.style.backgroundSize=`${e.target.width}px ${e.target.height}px`;
                d1.className="div div1";
                d1.style['animation-name']='ball2';
                d1.style['animation-duration'] = '0.3s';
                d1.style.backgroundPositionX=e.offsetX*-1 + 'px';
                d1.style.backgroundPositionY=e.offsetY*-1+ 'px';
        }
        if(e.target.dataset.mouse=="small"){
            //console.log(636666666)
            d1.style.background="";
            d1.className="div div4";
            d1.style['animation-name']='ball4';
            d1.style['animation-duration'] = '0.3s';
                      
        }
        if(e.target.dataset.mouse=="mid"){
            //console.log(99999999)
            d1.style.background="";
            d1.className="div div3"; 
            // d1.style['animation-name']='ball3';
            // d1.style['animation-duration'] = '0.3s';        
        }
    }
   all.onclick=function(e){
        //console.log(e)
        
        if(e.target.dataset.type!="share"){
            $( "#share").hide();
            $(".wxInfo").hide();
            $(".qqPage").hide(); 
        }
        d1.style['animation-name']='changeOp';
        d1.style['animation-duration'] = '0.2s';
        setTimeout(changeB,200)
   }
   function changeB(){
        d1.style['animation-name']='';
        d1.style['animation-duration'] = '';
    }
    function changeImg(e){
        //console.log(e,77777777777)
        //console.log(e.target.src,888888888);
        
    }
   var allPath="";
    if(window.location.pathname!="/"){
        allPath=`${window.location.origin}${window.location.pathname}`
    }else{
        allPath=`${window.location.origin}/`
    }
    function copyLink(str){
        var input =document.createElement("input");
        if(str){
            input.setAttribute("value",str);
        }else{
            input.setAttribute("value",window.location.href);
        }
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy')
        document.body.removeChild(input);
        $(".messageInfo").show();
        setTimeout(()=>{
        $(".messageInfo").hide(); 
        },1000)    
    }
    function changeInfo(num){
        if(num==1){
            $(".wxInfo").toggle();
            $(".qqPage").hide();
        }
    }
    function changeInfoM(num,type){
        if(num==1){
            $(".wxAndqq").toggle();
            $(".wxM").show();
            $(".qqPageM").hide();
        }
        if(num==2){
            $(".wxAndqq").toggle();
            $(".wxM").hide();
            $(".qqPageM").show();
        }
        if(num==3){
            if(type){
                $(".messageInfo").show();
                setTimeout(()=>{
                    $(".messageInfo").hide();
                },1000)
            }else{
                alertShow("敬请期待")
            }
            
        }   
    }
    var html = document.querySelector("html");
    var platform;
    window.onresize=function(){
        if(/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)) {
            platform="mobile";
        } else {
            platform="pc";
            var zoomR=window.innerWidth/1920;
            html.style.fontSize =zoomR*16+"px";
        }
    }
    $(document).ready(()=>{
        if(/Android|webOS|iPhone|iPad|BlackBerry/i.test(navigator.userAgent)) {
            platform="mobile";
            //setInterval(changeImgKv,90);
            $("#kvMobile").prop("src","./kv/m.mp4");
        } else {
            platform="pc";
            var zoomR=window.innerWidth/1920;
            html.style.fontSize =zoomR*16+"px";
            $("#kvPc").prop("src","./kv/p.mp4");
            try{
                showCharacter();    
            }catch(e){
                //console.log(e)
            }
            //角色页面缓存
        }
    })
document.addEventListener(
    "WeixinJSBridgeReady",
    function() {
        var video = document.getElementById("kvMobile");
        //video.play();
    },
    false
);
document.addEventListener("touchstart", function(){ 
    var video = document.getElementById("kvMobile");
        //video.play();
}, false);
var ikv=0;
var strkv;
var kvTimer=true;
function changeImgKv(){
    if(!kvTimer){
        return
    }   
    if(ikv<324){
        ikv++;
        if(ikv<10){
            strkv=`00${ikv}`
        }else if(ikv<100){
            strkv=`0${ikv}`
        }else{
            strkv=ikv;
        }
    }else{
        ikv=0;
        strkv=`000`;
    }
    $("#kvMobile").prop("src",`./m/m_00${strkv}.jpg`);
    //requestAnimationFrame(changeImg)
}


    