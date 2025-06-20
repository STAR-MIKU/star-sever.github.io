var gameUrl="/activity";
var gameModelData={
    "current": 1,
    "pageSize": 10
};
//游戏信息
function gameMsg(params){
   return new Promise((resolve,reject)=>{
            $.ajax({
            url: `${gameUrl}/official/websites/game/query`,
            type: 'post',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType:"application/json; charset=utf-8",
            success: function (res) {
                resolve(res.data)
            },
            error:function(err){
                reject(err)
            }
        })
    })
    
}

window.onload=gameMsg(gameModelData).then(data=>{
      data.pageData[0].qqGroupConfig.map(v=>{
        let str=`<div class="qqPage-list">
                <div class="qqPage-list-1">
                <span>${v.label}</span><span>${v.value}</span>
                </div>
                <div class="qqPage-list-2" onclick="copyLink(${v.value})" data-type="share">复制</div>
            </div>`;
        $(".qqPage").append(str);
        $(".qqPageM").append(str);
      });
      $("#iosDownload").prop("href",data.pageData[0].iOSDownloadUrl);
      $("#androidDownload").prop("href",data.pageData[0].androidDownloadUrl);
      $("#imgQR").prop("src",data.pageData[0].qrcodeUrl);
      $("#mobileDown").prop("href",data.pageData[0].doubleEndUrl);
      $("#icon").prop("href",data.pageData[0].iconUrl);
      $("#mumuDownload").prop("href",data.pageData[0].mumuDownloadUrl);

      $("#videoDetail").prop("src",data.pageData[0].pvVideoUrl);
      $("#videoDetailM").prop("src",data.pageData[0].pvVideoUrl);
      if(data.pageData[0].isGray){
        $("#all").addClass("grayAll")
      }
      if(data.pageData[0].yuyueBtnOpen){
        $(".first-yuyue").show();
        $(".first-4").hide();
        $(".mobile-allDown").hide();
        $(".yuyue-button").show();
      }else{
        $(".first-yuyue").hide();
        $(".first-4").show();
        $(".mobile-allDown").show();
        $(".yuyue-button").hide();
      }
});

//获取资讯title
function getAllTitle(num){
    let apple=gameModelData;
    apple.type=num;
    return new Promise((resolve,reject)=>{
            $.ajax({
            url: `${gameUrl}/official/websites/collection/query`,
            type: 'post',
            data: JSON.stringify(apple),
            dataType: 'json',
            contentType:"application/json; charset=utf-8",
            success: function (res) {
                resolve(res.data)
            },
            error:function(err){
                reject(err)
            }
        })
    })
}
// $(document).ready(()=>{
//     getAllTitle(1).then(data=>{
//         console.log(data,5555555555);
//     });
// })
//获取资讯列表
function getNewsList(num){
    return new Promise((resolve,reject)=>{
            $.ajax({
            url: `${gameUrl}/official/websites/information/query`,
            type: 'post',
            data: JSON.stringify(num),
            dataType: 'json',
            contentType:"application/json; charset=utf-8",
            success: function (res) {
                resolve(res.data)
            },
            error:function(err){
                reject(err)
            }
        })
    })
}
//获取资讯轮播图
function getNewsImg(num){
    return new Promise((resolve,reject)=>{
            $.ajax({
            url: `${gameUrl}/official/websites/picture/banner/query`,
            type: 'post',
            data: JSON.stringify(num),
            dataType: 'json',
            contentType:"application/json; charset=utf-8",
            success: function (res) {
                resolve(res.data)
            },
            error:function(err){
                reject(err)
            }
        })
    })
}
//获取视频列表
function getVideoList(num){
    return new Promise((resolve,reject)=>{
            $.ajax({
            url: `${gameUrl}/official/websites/video/query`,
            type: 'post',
            data: JSON.stringify(num),
            dataType: 'json',
            contentType:"application/json; charset=utf-8",
            success: function (res) {
                resolve(res.data)
            },
            error:function(err){
                reject(err)
            }
        })
    })
}
//获取音乐列表
function getMusicList(num){
    return new Promise((resolve,reject)=>{
            $.ajax({
            url: `${gameUrl}/official/websites/music/query`,
            type: 'post',
            data: JSON.stringify(num),
            dataType: 'json',
            contentType:"application/json; charset=utf-8",
            success: function (res) {
                resolve(res.data)
            },
            error:function(err){
                reject(err)
            }
        })
    })
}
//图集列表
function getPictureList(num){
    return new Promise((resolve,reject)=>{
            $.ajax({
            url: `${gameUrl}/official/websites/picture/query`,
            type: 'post',
            data: JSON.stringify(num),
            dataType: 'json',
            contentType:"application/json; charset=utf-8",
            success: function (res) {
                resolve(res.data)
            },
            error:function(err){
                reject(err)
            }
        })
    })
}

//QQ 群信息
function getQQGroupList(){
    return new Promise((resolve,reject)=>{
            $.ajax({
            url: `${gameUrl}/m1/yuyue202107/init`,
            type: 'post',
            dataType: 'json',
            contentType:"application/json; charset=utf-8",
            success: function (res) {
                resolve(res.data)
            },
            error:function(err){
                reject(err)
            }
        })
    })
}