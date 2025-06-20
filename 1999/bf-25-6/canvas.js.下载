//人物立绘
var canvas = document.getElementById("c1");
var canvas2 = document.getElementById("c2");
var context = canvas.getContext("2d");
var context2 = canvas2.getContext("2d");
var video = document.getElementById("v1");
var canvasId=null;
video.oncanplay = function() {
    if(bannerIndex==2){
        video.play()
    }
    
}
function switchToCanvas() {
    // 将video上的图片的每一帧以图片的形式绘制的canvas上
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    var data1=context.getImageData(0,0,canvas.width,canvas.height/2);
    var data2=context.getImageData(0,canvas.height/2,canvas.width,canvas.height/2);
     for (let i=0;i<data2.data.length;i+=4)
        { 
            if(data2.data[i]<=90){
                data2.data[i+3]=0
            }else{
                data2.data[i]=data1.data[i]
                data2.data[i+1]=data1.data[i+1]
                data2.data[i+2]=data1.data[i+2]
                data2.data[i+3]=255
            }
        
        }
    show(data2)
}
function show(data){
    context2.putImageData(data,0,0);
    canvasId=requestAnimationFrame(switchToCanvas);
}
video.onended=function(e){
    console.log(e)
    if(e.target.duration>2){
        console.log(111111111)
        $("#c2").addClass("characterFadeOut");
        setTimeout(()=>{
            $("#c2").removeClass("characterFadeOut characterFadeInRight");
            $("#roleLiveing").click();
            $("#c2").addClass("characterFadeIn");
        },800);
        setTimeout(()=>{
            $("#c2").removeClass("characterFadeIn");
        },1000);
         //$("#roleLiveing").trigger("click")
    }  
}


    // var myWoker=new Worker("./js/woker.js",{name:"firstWoker"});
    // var canvas = document.getElementById("c1");
    // var canvas2 = document.getElementById("c2");
    // var context = canvas.getContext("2d");
    // var context2 = canvas2.getContext("2d");
    // var video = document.getElementById("v1");
    // var canvasId=null;
    // video.oncanplay = function() {
    //     video.play();
    // }
    // function send(data1,data2){
    //     myWoker.postMessage({d1:data1,d2:data2});
    // }  
    // function app1(){
    //    // console.log(22)
    //    if(bannerIndex!=2){
    //     return
    //    }
    //     context.drawImage(video, 0, 0, canvas.width, canvas.height);
    //     var data1=context.getImageData(0,0,canvas.width,canvas.height/2);
    //     var data2=context.getImageData(0,canvas.height/2,canvas.width,canvas.height/2);
    //     send(data1,data2)
    // }
    //  myWoker.onmessage=ev=>{
    //     //console.log(222,ev)
    //     context2.putImageData(ev.data,0,0);
    // }
    // //window.requestAnimationFrame(app1)
    // setInterval(app1,80)
