   var interleaveOffset = 0.8; //视差比值
  var backstoryStr=[
    `1999年12月31日，23点59分。世纪之交的缝隙中，一场“暴雨”往天空倾泻。所有派对、彩灯、末班巴士都在下一刻消逝。世界回到了一个崭新的旧时代。<br>

    一个年轻的小姑娘，一位“司辰”，唯一不受雨水侵袭之人，无数时代的见证者。她在洪流中穿梭，结识来自不同时代与国家的神秘学家伙伴。而后，带领他们……逃离“暴雨”。
    `,
    `每个时代都有它的标志性城市，60年代属于伦敦，而20年代毫无疑问属于纽约。<br>
    1920年代的纽约，现代科学也在化一切为可能。福特汽车、无线电的使用，将世界推向乐观浪潮的更远处。爵士乐响彻通宵，人们在查尔斯顿舞步中奔赴下一场宴会。<br>
    没有人能拒绝加入这场狂欢。
    `,
    `20世纪60年代的一切都很好。波普艺术和嬉皮士风格开始在年轻人中流行起来，伦敦成为了“酷的中心”（Capital of Cool）。<br>更重要的是，海盗电台和摇滚乐在此兴起了。`,
    `一场不可思议的天方夜谭：第一滴雨滴坠入天空时，诡谲的异变随即伴生而来。<br>
      60年代的波普与色彩，20年代的铂金与爵士……随时代更迭，异变的体征亦有所不同。它就像是某种幻象，或者时代的海市蜃楼。
    ` ,
    `数千年来，人类第一防线学校接收了无数失去归所的神秘学家孩子，并为其提供系统的神秘学训练。<br>由此毕业的学生往往被视为人才模范，进入圣洛夫基金会、拉普拉斯科算中心、芝诺军备学院等世界前列组织。<br>
     但无论身处何处，这些白与灰菱格之下长大的孩子们从未忘却他们的准则与训诫——为了人类，为了和平。`,
    `万物皆有因果，世界衔于一蛇。<br>
    拉普拉斯科学计算中心在几次工业革命中声名鹊起，依凭着新锐技术与时代强风，发展成为世界上规模最为庞大的科研机构。<br>他们旨在研究科技与神秘术的结合，并推动第四次工业革命的到来。<br>
    在“暴雨”到来后，其主张以因果律为核心理论依据，由此演算、推导出回溯的原因与人类到达未来的可能性。`,
    `纺车。辅以湿润的雾气与流淌的河。它充满了神秘气息，总有人在其呼唤中欣然到访。<br>
    而你所需要做的，仅仅是——转动它。`,
    `一只深紫色菱格纹的手提箱。比羽毛重一些，较金锭轻一些。由一道不算复杂的咒语开启，通往一处开阔的居所。<br>
     其中罗列的门与窗数不胜数，各自通往不同的光景。这里不受“暴雨”的侵扰，可留存时代的印记。可预见的，将有许多神秘学家在此立足存身。`
  ]
  var pcbackstory = new Swiper("#pcbackstory", {
        
        speed: 1000,
        observer: true, 
        observeParents: true,
        observeSlideChildren: true,
        // watchSlidesProgress: true,
        loop:true,
        navigation: {
          nextEl: "#backstoryNext",
          prevEl: "#backstoryPre",
        },
        // on:{
        
        // }
        on: {
          slideChange:function(){
            //console.log(this.realIndex)
            changeBackstory(this.realIndex);
          },
          // progress: function(swiper) {
          //   for (var i = 0; i < swiper.slides.length; i++) {
          //   var slideProgress = swiper.slides[i].progress;
          //   var innerOffset = swiper.width * interleaveOffset;
          //   var innerTranslate = slideProgress * innerOffset;
          //   swiper.slides[i].querySelector(".slide-inner").style.transform =
          //     "translate3d(" + innerTranslate + "px, 0, 0)";
          //   }      
          // },
          // touchStart: function(swiper) {
          //   for (var i = 0; i < swiper.slides.length; i++) {
          //   swiper.slides[i].style.transition = "";
          //   }
          // },
          // setTransition: function(swiper, speed) {
          //   for (var i = 0; i < swiper.slides.length; i++) {
          //   swiper.slides[i].style.transition = speed + "ms";
          //   swiper.slides[i].querySelector(".slide-inner").style.transition =
          //     speed + "ms";
          //   }
          // }
	    }
      });
      function changeBackstory(num){
        for(let i=1;i<9;i++){
          let strId=`#backstoryImg${i}`;
          $(strId).attr("src",`./img/backstory/${i}.png`);
        }
        let checkId=`#backstoryImg${num+1}`;
        $(checkId).attr("src",`./img/backstory/${num+1}_1.png`);
        $("#backstoryTitle").attr("src",`./img/backstory/t${num+1}.png`).removeClass("animate__animated animate__fadeInUp");
        $("#backstoryStr").html(backstoryStr[num]).removeClass("animate__animated animate__fadeInUp");
        setTimeout(function(){
          $("#backstoryTitle").addClass("animate__animated animate__fadeInUp");
          $("#backstoryStr").addClass("animate__animated animate__fadeInUp");
        },10)
      }
      changeBackstory(0)
      function changeBackstoryClick(num){
        pcbackstory.slideTo(num+1);
      }
      
