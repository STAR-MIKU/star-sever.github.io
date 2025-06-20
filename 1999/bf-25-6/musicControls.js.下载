var musicTimer;
function muteMusic(num){
    //console.log($("#bgm"));
    if(num==1){
        $("#bgm")[0].pause();
        $(".imgMusicPlay").hide();
        $(".imgMusicStop").show();  
    }
    if(num==2){
        $("#bgm")[0].play();
        $(".imgMusicPlay").show();
        $(".imgMusicStop").hide();  
    }
    
}
function changeGalleryMusic(type){
    if(type=="play"){
        muteMusic(1);
        $(".music-z").show();
        $(".music-pc").hide();
        $("#allMusic")[0].play();
        // $(".musicmask-player-con-mid-img-img").addClass("music-rotate");
        $(".musicmaskDetail-con-left-record").addClass("music-rotate");
        // $(".musicmask-player-left-mobile").addClass("music-rotate");
        $(".musicmaskDetail-con-top-record-mobile").addClass("music-rotate");
        musicTimer=setInterval(changeMusicProgress,500);
    }
    if(type=="stop"){
        $(".music-z").hide();
        $(".music-pc").show();
        $("#allMusic")[0].pause();
        // $(".musicmask-player-con-mid-img-img").removeClass("music-rotate");
        $(".musicmaskDetail-con-left-record").removeClass("music-rotate");
        // $(".musicmask-player-left-mobile").removeClass("music-rotate");
        $(".musicmaskDetail-con-top-record-mobile").removeClass("music-rotate");
        //console.log($("#allMusic"));
    }
}
function changeMusicProgress(){ 
    //音乐结束
    if($("#allMusic")[0].ended){
        //console.log(777)
        $(".music-z").hide();
        $(".music-pc").show();
        // $(".musicmask-player-con-mid-img-img").removeClass("music-rotate");
        $(".musicmaskDetail-con-left-record").removeClass("music-rotate");
        clearInterval(musicTimer);
        return
    }
    let percent=(($("#allMusic")[0].currentTime)/($("#allMusic")[0].duration)).toFixed(4);
    //console.log(percent,666666666)
    let width=$("#progress1")[0].offsetWidth*percent;
    $("#progressNow1").css("width",width);
    $("#progressNow2").css("width",width);
    //手机端进度条
    let widthMobile=$("#progressM")[0].offsetWidth*percent;
    $("#progressNowM").css("width",widthMobile);
    let data=getTimeFromSeconds($("#allMusic")[0].currentTime);
    let allData=getTimeFromSeconds($("#allMusic")[0].duration);
    //console.log(data,999)
    $(".musicmaskDetail-con-right-bottom-bottom-time-start-pc").text(data);
    $(".musicmaskDetail-con-right-bottom-bottom-time-end-pc").text(allData);
    $(".musicmaskDetail-con-right-bottom-bottom-time-mobile-start").text(data);
    $(".musicmaskDetail-con-right-bottom-bottom-time-mobile-end").text(allData);
}
