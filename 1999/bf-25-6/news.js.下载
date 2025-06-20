let imgList=[];

function showNewsImg(){
  var mySwiper = new Swiper('#newsLeft',{
  autoplay: {
    delay: 10000
  },
    on:{
        slideChange:function(){
         // console.log(555)
          changePage(this.realIndex)
        },
        click:function(){
          
        }
      }
  })
  var  newsNum={
    "current": 1,
    "pageSize": 5,
  };
  //获取置顶信息
  getNewsImg(newsNum).then(res=>{
   // console.log(res,666666);
    imgList=[];
    res.pageData.map(v=>{
      imgList.push({
        id:v.title,
        guideUrl:v.pictureUrl
      })
    })
    imgNewsRender();
    newMobileImgRender();
  }) 
}
function imgNewsRender(){
  imgList.map((v,index)=>{
    let str=`<div class="swiper-slide news-left-con" onclick="goImg(${index})"><img src="${v.guideUrl}" style="width:100%;;" data-mouse="mid"></div>`;
    let str2=`<div class="page-icon" data-mouse="small" id="newsPage${index}"></div>`;
    $('#imgNews').append(str);
    $('#newsPage').append(str2);
  })
  changePage(0); 
}
//左图分页
 function changePage(num){
      //console.log(num,9999)
      let id=`#newsPage${num}`;
      $('#newsPage').children(".page-icon").removeClass('page-icon-active');
      $(id).addClass('page-icon-active');
    }


//新闻数据
//1最新 2公告 3活动 4新闻
let newsData=[];
//图片跳转
function goImg(index){
  if(imgList[index].id){
    window.open(`${imgList[index].id}`,'_blank');
  }
  //console.log(index,66)
}
//详情跳转
function goNews(index){
  //console.log(index);
  var path="";
  if(window.location.pathname!="/"){
    path=window.location.pathname
  }
  window.open(`./detail.html#newsId?${index}`,'_blank');
}
function setNews(num){
  var title;
  if(num==0){
    title="最新"
  }
  if(num==1){
    title="公告"
  }
  if(num==2){
    title="活动"
  }
  if(num==3){
    title="新闻"
  };
  $(".news-right-con").empty();
  newsData.map((v,index)=>{
    let time=v.onlineTime.split(" ");
    let str=`<div class="news-right-con-list animate__animated animate__fadeIn" data-news="${v.id}" onclick="goNews(${v.id})">
                    <div class="news-right-con-list-left">
                      <div class="news-right-con-list-left-icon">
                        <img src="./img/see.png" alt="">
                      </div>
                      <div class="news-right-con-list-left-type">${title}</div>
                      <div class="news-right-con-list-left-title">${v.title}</div>
                    </div>
                    <div class="news-right-con-list-left-time">${time[0]}</div>
                  </div>`;
    $(".news-right-con").append(str)               
  })
}

function goToMore(){
  var path="";
  if(window.location.pathname!="/"){
    path=window.location.pathname
  }
  window.open(`${allPath}detail.html#news`,'_blank');
}
//新闻导航切换
function changeNews(num){
  let id=`#news${num}`;
  $('.news-right-head-bg').children(".news-right-head-bg-list").removeClass('news-right-head-bg-list-active');
  $(id).addClass('news-right-head-bg-list-active');
  // if(num==1||num==0){
  //   newsData.map(v=>{
  //     v.title="《重返未来：1999》理想国测试FAQ";
  //     v.id=1;
  //   })
  // }
  // if(num==2){
  //    newsData.map(v=>{
  //     v.title="《重返未来：1999》广州CICFxAGF参展决定";
  //     v.id=2;
  //   })
  // }
  // if(num==3){
  //   newsData.map(v=>{
  //     v.title="《重返未来：1999》理想国测试PV公开";
  //     v.id=3;
  //   })
  // }
  let numdata={
    "informationType": num?num+1:"",
    "current": 1,
    "pageSize": 5,
  } ;

  getNewsList(numdata).then(data=>{
   // console.log(data,12345);
    newsData=data.pageData;
    setNews(num);
  })
}
changeNews(0);
changeNewsM(0);
showNewsImg();


