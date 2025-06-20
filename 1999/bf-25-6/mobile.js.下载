//导航栏切换隐藏 head
function changeHead(num){
    if(num==1){
      $(".menucMobile").show();
      $(".menuMobile").hide();
      $(".headM").show();
    }
    if(num==2){
      $(".menucMobile").hide();
      $(".menuMobile").show();
      $(".headM").hide();
    }
}
var pretranslate=0;
var activeMobile=0;
var swiperAllM = new Swiper("#allSwiperMobile", {
        direction: "vertical",
        speed:300,
        mousewheel: true,
        // pagination: {
        //   el: ".swiper-pagination",
        //   clickable: true,
        // },
        on:{
          slideChange:function(){
            //console.log(99999999,this.activeIndex)
            changeBannerMobile(this.activeIndex);
           
            //changeBannerCssHideM(this.activeIndex);
            if(this.activeIndex==0&&platform=="mobile"){
              kvTimer= true
            }else{
              kvTimer=false;
            }
          },
          touchEnd: function(swiper,event){
            //console.log(swiper.translate);
          },
          slideChangeTransitionEnd: function(swiper,event){
            //console.log(this.activeIndex,1234156)
            activeMobile=this.activeIndex;
            pretranslate=swiper.translate;
            
            let data=[1,2,3,4];
            data.map(v=>{
              if(v!=this.activeIndex){
                changeBannerCssHideM(v);
              }
            })
            changeBannerCssM(this.activeIndex);
          },
          touchMove(swiper,event){
            //console.log(66666)
          }
        }
      });
    function changeBannerMobile(num){
      
      let id=`#bannerM${num}`;
      //console.log(id,9999)
      $('.div-center-mobile').children(".div-head-text").removeClass('div-head-text-active');
      $('.div-center-mobile').children(".div-head-text-en").removeClass('div-head-text-en-active');
      $(id).children(".div-head-text").addClass('div-head-text-active');
      $(id).children(".div-head-text-en").addClass('div-head-text-en-active');
      changeHead(2);
      swiperAllM.slideTo(num);
      //弹窗隐藏
       $(document).ready(()=>{
          $("#newsmaskMobile").hide();
          $("#videomaskMobile").hide();
          $("#musicmaskMobile").hide();
          $("#musicmaskDetailMobile").hide();
          $("#papermaskMobile").hide();
      })
    }
    changeBannerMobile(0);//切换导航
    function changeStatementMobile(type){
      $(".statementMobile").show();
      if(type){
        $("#allSwiperMobile").css({
          "transform":"translate(0,-30vh)",
          "transition": "all 0.3s"
        })
        $(".head-mob").css({
          "transform":"translate(0,-30vh)",
          "transition": "all 0.3s"
        })
        $(".statementMobile").css({
          "transform":"translate(0,-30vh)",
          "transition": "all 0.3s"
        })
      }else{
        $("#allSwiperMobile").css({
          "transform":"translate(0,0)",
          "transition": "all 0.3s"
        })
        $(".statementMobile").css({
          "transform":"translate(0,0)",
          "transition": "all 0.3s"
        })
        $(".head-mob").css({
          "transform":"translate(0,0)",
          "transition": "all 0.3s"
        })
        swiperAllM.enable();
      }
      
    }
    //滑动处理 
    var startX, startY; 
    document.addEventListener('touchstart',function (ev) { 
      startX = ev.touches[0].pageX; 
      startY = ev.touches[0].pageY; 
    }); 
    document.addEventListener('touchend',function (ev) { 
      var endX, endY; 
      endX = ev.changedTouches[0].pageX; 
      endY = ev.changedTouches[0].pageY; 
      var direction = GetSlideDirection(startX, startY, endX, endY); 
      switch(direction) { 
        case 0: 
            //console.log("无操作"); 
          break; 
        case 1: 
          // 向上 
          if(activeMobile==4){
              swiperAllM.disable();
              changeStatementMobile(true);
          } 
          break; 
        case 2: 
          // 向下 
          if(activeMobile==4){
            changeStatementMobile(false);
          }
          break; 
        case 3:
          if(activeMobile==2){
            console.log("右");
            swipreCharacterM.slidePrev();
          }
          if(activeMobile==3){
            backstoryMobileChange(-1)
          }
          break;
        case 4:
          if(activeMobile==2){
            console.log("左");
            swipreCharacterM.slideNext();
          }
          if(activeMobile==3){
            backstoryMobileChange(1)
          }
          break;    
        default: 
      } 
    });
    function GetSlideDirection(startX, startY, endX, endY) { 
      var dy = startY - endY; 
      var dx = endX - startX; 
      var result = 0; 
      // if(dy>0) {//向上滑动 
      //   result=1; 
      // }else if(dy<0){//向下滑动 
      //   result=2; 
      // }
      // if(dx>20){
      //   console.log(1)//右滑
      //   result=3; 
      // }else if(dx<-20){
      //   console.log(2)//左滑
      //   result=4; 
      // }
      if(Math.abs(dy)>Math.abs(dx)){
        if(dy>10){
          result=1;
        }else if(dy<-10){
          result=2
        }
      }else{
        console.log(window.event)
        if(dx>10){
          result=3
        }else if(dx<-10){
          result=4
        }
      }
      
      return result; 
    }

    function changeBannerCssM(num){
      if(num==0){
        $(".head-mob-logo").show();
      }
      if(num==4){
        $(".galleryMobile-1").show();
        $(".galleryMobile-2").show();
        $(".galleryMobile-3").show();
      }
      if(num==1){
        $(".newsMobile-top").show();
        $(".newsMobile-mid").show();
        $(".newsMobile-bottom").show();
        $("#newsLeftM").show();
        $(".news-right-head-bg").show();

      }
    
      if(num==2){
        $(".characterMobile-top").show();
        $(".characterMobile-mid").show();
      }
      if(num==3){
        $(".backstoryMobile-top").show();
        $(".backstoryMobile-mid").show();
        $("#backstoryMobileTitle").show();
      }
    } 
    //隐藏动效
    function changeBannerCssHideM(num){
      if(num==0){
        $(".head-mob-logo").show();
      }
      if(num==1){
         $(".newsMobile-top").hide();
         $(".newsMobile-mid").hide();
         $(".newsMobile-bottom").hide();
         $(".head-mob-logo").hide();
      }
      if(num==2){
        $(".characterMobile-top").hide();
        $(".characterMobile-mid").hide();
        $(".head-mob-logo").hide();
      }
      if(num==3){
        $(".backstoryMobile-top").hide();
        $(".backstoryMobile-mid").hide();
        $("#backstoryMobileTitle").hide();
        $(".head-mob-logo").hide();
      }
      if(num==4){
        $(".galleryMobile-1").hide();
        $(".galleryMobile-2").hide();
        $(".galleryMobile-3").hide();
        $(".head-mob-logo").hide();
      }
    }
    $(document).ready(()=>{
      changeBannerCssHideM(1);
      changeBannerCssHideM(2);
      changeBannerCssHideM(3);
      changeBannerCssHideM(4);
      $(".head-mob-logo").show();
    })
   function hideHeadM(){
    let e=window.event;
    //console.log(e)
    if(!e.target.dataset.type){
      changeHead(2)
    }
   }
