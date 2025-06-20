var swipreCharacterM = new Swiper('#characterM',{
                slidesPerView:4,   //分组显示
                centeredSlides:false,  //页面居中
                observer:true,
                observeParents:false,
                slideToClickedSlide: true,
                freeMode: true,
                loop:true,
                slidesOffsetBefore:-10, 
                touchRatio : 0,
                on:{
                    slideChange:function(e){
                        //e.update();
                        //切换人物立绘
                        //需要使用class选择器不能用id  qaq
                        //console.log(e,8888888888888888)
                        changeCharacterM(e.realIndex)
                    },
                    click(e){
                        
                        
                    },
                    slideChangeTransitionStart: function(e){
                        // console.log(this,222222222)
                        
                    },
                    slideNextTransitionEnd: function(e){
                       
                    },
                }
      
            });
 function changeCharacterM(num){
                    characterMsg.map((v,index)=>{
                        let id=`.roleM${index+1}`;
                        //console.log($(id))
                        $(id).attr("src",`./img/character/${v.nocheck}`);
                     })
                     let data=characterMsg[num];
                     //console.log(data,999999999)
                    let idM=`.roleM${num+1}`;
                     
                    $(idM).attr("src",`./img/character/${data.check}`);
                     $("#roleImgM").removeClass("characterFadeInRight").addClass("characterFadeOutLeft");
                     $("#roleTitleM").removeClass("characterFadeInRight").addClass("characterFadeOutLeft");
                     $("#roleBgM").removeClass("animate__animated animate__fadeIn").addClass("animate__animated animate__fadeOut");
                     //播放器路径
                     $("#roleMusicM").prop("src",data.voice);
                     $("#roleButtonM").removeClass("fadeInUpSelf").addClass("fadeOutBottomSelf");
                     $("#roleStrM").removeClass("characterFadeInRight").addClass("characterFadeOutLeft");
                     $("#roleLiveM").show();
                     $("#roleLiveingM").hide();
                     playCharacterVioceM(2);
                     //jq设置的data不会在dom中显示
                     $("#roleLiveM").data("url",`./img/role/${data.gifm}`);
                     $("#roleLiveM").data("oldUrl",`./img/role/${data.rolem}`);
                     $("#roleVoiceM").data("url",`${data.voice}`);
                     //console.log($("#roleLive").data("url"),2222222222222)
                     setTimeout(() => {
                        $("#roleImgM").removeClass("characterFadeOutLeft").prop("src",`./img/role/${data.rolem}`).addClass("characterFadeInRight");;
                        $("#roleTitleM").removeClass("characterFadeOutLeft").prop("src",`./img/role/${data.title}`).addClass("characterFadeInRight");
                        $("#roleBgM").css("background-image",`url(./img/role/${data.bg})`).removeClass("animate__animated animate__fadeOut").addClass("animate__animated animate__fadeIn");
                        $("#roleButtonM").removeClass("fadeOutBottomSelf").addClass("fadeInUpSelf");
                        $("#roleStrM").html(data.str).removeClass("characterFadeOutLeft").addClass("characterFadeInRight");
                     }, 500);
                     
    }
    function changeLiveM(num){
        if(num==1){
            let url=$("#roleLiveM").data("url");
            $("#roleImgM").prop("src",url);
            $("#roleLiveM").hide();
            $("#roleLiveingM").show();
        }
        if(num==2){
            let url=$("#roleLiveM").data("oldUrl");
            $("#roleImgM").prop("src",url);
            $("#roleLiveM").show();
            $("#roleLiveingM").hide();
        }
    }
  
    function playCharacterVioceM(num){
        if(num==1){
            $("#roleMusicM")[0].play();
            $("#roleVoiceingM").show();
            $("#roleVoiceM").hide();
            muteMusic(1);
        }
        if(num==2){
            $("#roleMusicM")[0].pause();
            $("#roleVoiceingM").hide();
            $("#roleVoiceM").show();
        }
    }
    $("#roleMusicM")[0].addEventListener("ended", function() {
			playCharacterVioceM(2)
	})            