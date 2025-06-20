var bannerIndex=0;//当前激活的banner
var wheelIndex=false;
var swiperAll = new Swiper("#allSwiper", {
        direction: "vertical",
        speed:300,
        // pagination: {
        //   el: ".swiper-pagination",
        //   clickable: true,
        // },
        mousewheel: true,
        noSwiping: true,
        noSwipingClass: 'swiperBG',
        on:{
          slideChange:function(){
            //console.log("test4",document)
            wheelIndex=false;
            changeBanner(this.activeIndex);
            changeBannerCssHide(this.activeIndex)
          },
          touchEnd: function(swiper,event){
            //console.log(6231564)
          },
          slideChangeTransitionEnd: function(){
            bannerIndex=this.activeIndex;
            changeBannerCss(this.activeIndex);
          },
          slideChangeTransitionStart: function(){
            if(this.activeIndex!=4){
              bannerIndex=this.activeIndex;
            }
            if(this.activeIndex!=2){
              $(".character").css("background",``);
            }
          }
        }
      });
    function changeBanner(num){
      // console.log(num,9999)
      wheelIndex=0;
      let id=`#banner${num}`;
      $('.div-centerpc').children(".div-head-text").removeClass('div-head-text-active');
      $('.div-centerpc').children(".div-head-text-en").removeClass('div-head-text-en-active');
      $(id).children(".div-head-text").addClass('div-head-text-active');
      $(id).children(".div-head-text-en").addClass('div-head-text-en-active');  
      swiperAll.slideTo(num);
      //console.log(swiperAll,6666)
      //隐藏弹窗
      maskType=false;
      $(document).ready(()=>{
        $("#newsmask").hide();
        $("#videomask").hide();
        $("#musicmask").hide();
        $("#musicmaskDetail").hide();
        $("#papermask").hide();
        $("#newsDetail").hide();
      })
      
      
    }
    changeBanner(0)
    document.onmousewheel=scrollFunc;
    document.onwheel=scrollFunc;//火狐绑定滚轮
    function scrollFunc (e){
      // console.log(e,5555555555555)
      e = e || window.event; 
      if(bannerIndex==4){
        wheelIndex=true;
      }else{
        wheelIndex=false;
      }
      if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件 
          if(!wheelIndex){
            swiperAll.enable();
          }else{
            if (e.wheelDelta > 100) { //当滑轮向上滚动时  
              //  console.log('上滚')
               if(bannerIndex==4){
                changeStatement(false);
               }
            }  
            if (e.wheelDelta < -100) { //当滑轮向下滚动时  
                //  console.log('下滚')
                 if(bannerIndex==4){
                  changeStatement(true);
                  
                  wheelIndex=true;
                 }
            } 
          }                    
        } else if (e.detail) {  //Firefox滑轮事件  
            if (e.detail> 100) { //当滑轮向下滚动时  
               //console.log('下滚')
                 if(bannerIndex==4){
                  changeStatement(true);
                  
                  wheelIndex=true;
                 }
            }  
            if (e.detail< -100) { //当滑轮向上滚动时  
                //console.log('上滚') 
                if(bannerIndex==4){
                  changeStatement(false);
               } 
            }  
        }      
    }
    function changeStatement(type){
      if(type){
        swiperAll.disable();
        $(".statement").show();
        //$("#allSwiper").toggleClass("statementHeight");
        $("#allSwiper").css({
          "transform":"translate(0,-20vh)",
          "transition": "all 0.3s"
        })
        $(".statement").css({
          "transform":"translate(0,-20vh)",
          "transition": "all 0.3s"
        })
      }else{
        //$("#allSwiper").toggleClass("statementHeight");
        $("#allSwiper").css({
          "transform":"translate(0,0)",
          "transition": "all 0.3s"
        })
        $(".statement").css({
          "transform":"translate(0,0)",
          "transition": "all 0.3s"
        })  
        swiperAll.enable();
      }
      
    }

    
    //动效增加
    function changeBannerCss(num){
      if(num==4){
        $(".gallery-top-1").show();
        $(".gallery-top-2").show();
        $(".gallery-top-3").show();
        $(".gallery-top-4").show();
        $(".gallery-top-5").show();
        $(".gallery-top-6").show();
        cancelAnimationFrame(canvasId);
      }
      if(num==1){
        $(".news-left").show();     
        $(".news-right-head-img").show();
        $(".news-right-head-bg").show();
        $(".news-right-con").show();
        $(".news-right-foot").show();   
        cancelAnimationFrame(canvasId);    
      }
    
      if(num==2){
        video.play();
        $(".character").css("background",`url("./img/BG.png") no-repeat bottom`);
        $(".character").css("background-size", "cover");
        $(".character-left").show();
        $(".character-right").show();
        $(".character-right-right").show();
        characterStorage();
        switchToCanvas();
      }
      if(num==3){
        $(".backstory-left").show();
        $(".backstory-right").show();
        cancelAnimationFrame(canvasId);
      }
      if(num==0){
        cancelAnimationFrame(canvasId);
      }
    }
    //设置显示隐藏
    function changeBannerCssHide(num){
      if(num==1){
         $(".news-left").hide();
         $(".news-right-head-img").hide();
         $(".news-right-head-bg").hide();
         $(".news-right-con").hide();
         $(".news-right-foot").hide();
      }
      if(num==2){
        $(".character-left").hide();
        $(".character-right").hide();
        $(".character-right-right").hide();
      }
       if(num==3){
        $(".backstory-left").hide();
        $(".backstory-right").hide();
        
      }
       if(num==4){
        $(".gallery-top-1").hide();
        $(".gallery-top-2").hide();
        $(".gallery-top-3").hide();
        $(".gallery-top-4").hide();
        $(".gallery-top-5").hide();
        $(".gallery-top-6").hide();
      }
    }