//埋点相关
var cur_date = (+new Date());
//连接后的页面曝光时间相关
var finishLoadedDate = cur_date;
var lastFrontDate = cur_date;
var totalDeskTopTime = 0;

//我的设备页面曝光时间相关
var isManagerShow = false;
var finishLoadManagerDate = cur_date;
var lastManagerFrontDate = cur_date;
var totalDeskTopManagerTime = 0;

//照片页面曝光时间相关
var isPhotoShow = false;
var finishLoadPhotoDate = cur_date;
var lastPhotoFrontDate = cur_date;
var totalDeskTopPhotoTime = 0;

//视频页面曝光时间相关
var isVideoShow = false;
var finishLoadVideoDate = cur_date;
var lastVideoFrontDate = cur_date;
var totalDeskTopVideoTime = 0;

//文档页面曝光时间相关
var isDocShow = false;
var finishLoadDocDate = cur_date;
var lastDocFrontDate = cur_date;
var totalDeskTopDocTime = 0;

//文件页面曝光时间相关
var isFileShow = false;
var finishLoadFileDate = cur_date;
var lastFileFrontDate = cur_date;
var totalDeskTopFileTime = 0;

//上传页面曝光时间相关
var isUploadShow = false;
var finishLoadUploadDate = cur_date;
var lastUploadFrontDate = cur_date;
var totalDeskTopUploadTime = 0;

//upload
var preUploadCount = 0;
var uploadedSuccess = 0;
var upoladedFail = 0;
var uploadWay = 0;

var isTrackLoaded = false;
var cacheEvents = [];

var __mztj = {
    unload: true,
    hostname: "linkpc.flyme.com"
};
(function () {
    var ga = document.createElement('script'), s;
    ga.type = 'text/javascript';
    ga.src = 'https://tongji-res.meizu.com/resources/tongji/flow.js';
    s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
    try {
        ga.onload = function() {
            isTrackLoaded = true;
            try {
                console.log("onLoaded", cacheEvents);
                for (let i = 0; i < cacheEvents.length; i++) {
                    MeizuBH(cacheEvents[i]);
                }
                cacheEvents = [];
            } catch(e) {
                console.log("track cache error", e);
            }
        }
    } catch(e) {
        console.log("onload error", e);
    }
})();

function track(key, params) {
    try {
        params.action = key;
        if (isTrackLoaded) {
            MeizuBH(params);
        } else {
            cacheEvents.push(params);
        }
        //console.log(JSON.stringify(params));
    } catch(e){
        console.log("track error", e);
    }
}


function toSwitchBack() {
    var curDate = (+new Date());

    totalDeskTopTime = totalDeskTopTime + (curDate - lastFrontDate);
    lastFrontDate = curDate;

    if (isManagerShow) {
        totalDeskTopManagerTime = totalDeskTopManagerTime + (curDate - lastManagerFrontDate);
        lastManagerFrontDate = curDate;
    }

    if (isPhotoShow) {
        totalDeskTopPhotoTime = totalDeskTopPhotoTime + (curDate - lastPhotoFrontDate);
        lastPhotoFrontDate = curDate;
    }

    if (isVideoShow) {
        totalDeskTopVideoTime = totalDeskTopVideoTime + (curDate - lastVideoFrontDate);
        lastVideoFrontDate = curDate;
    }

    if (isDocShow) {
        totalDeskTopDocTime = totalDeskTopDocTime + (curDate - lastDocFrontDate);
        lastDocFrontDate = curDate;
    }

    if (isFileShow) {
        totalDeskTopFileTime = totalDeskTopFileTime + (curDate - lastFileFrontDate);
        lastFileFrontDate = curDate;
    }

    if (isUploadShow) {
        totalDeskTopUploadTime = totalDeskTopUploadTime + (curDate - lastUploadFrontDate);
        lastUploadFrontDate = curDate;
    }
}

function toSwitchFront() {
    var curDate = (+new Date());

    lastFrontDate = curDate;

    if (isManagerShow) {
        lastManagerFrontDate = curDate;
    }

    if (isPhotoShow) {
        lastPhotoFrontDate = curDate;
    }

    if (isVideoShow) {
        lastVideoFrontDate = curDate;
    }

    if (isDocShow) {
        lastDocFrontDate = curDate;
    }

    if (isFileShow) {
        lastFileFrontDate = curDate;
    }

    if (isUploadShow) {
        lastUploadFrontDate = curDate;
    }
}

//index
function trackFinishLoadTime() {
    finishLoadedDate = (+new Date());
    lastFrontDate = (+new Date());
}


function getPageStayTime() {
    return ((+new Date()) - finishLoadedDate)
}

function getFrontStayTime() {
    totalDeskTopTime = totalDeskTopTime + (+new Date() - lastFrontDate);
    lastFrontDate = (+new Date());
    return totalDeskTopTime;
}

function disconnect() {

}


//manager
function trackfinishLoadManagerTime() {
    isManagerShow = true;
    totalDeskTopManagerTime = 0;
    finishLoadManagerDate = (+new Date());
    lastManagerFrontDate = (+new Date());
}
function trackUnInstallManagerTime() {
    isManagerShow = false;
    var pageTime = +new Date() - finishLoadManagerDate;
    totalDeskTopManagerTime = totalDeskTopManagerTime + (+new Date() - lastManagerFrontDate);
    lastManagerFrontDate = (+new Date());
    track("my_device_page_exspore", {
        my_device_page_exspore_time: pageTime,
        my_device_page_exspore_indesktop_time: totalDeskTopManagerTime
    })
}


//Photo
function trackfinishLoadPhotoTime() {
    if (isPhotoShow) {
        return;
    }
    isPhotoShow = true;
    totalDeskTopPhotoTime = 0;
    finishLoadPhotoDate = (+new Date());
    lastPhotoFrontDate = (+new Date());
}
function trackUnInstallPhotoTime() {
    isPhotoShow = false;
    var pageTime = +new Date() - finishLoadPhotoDate;
    totalDeskTopPhotoTime = totalDeskTopPhotoTime + (+new Date() - lastPhotoFrontDate);
    lastPhotoFrontDate = (+new Date());

    track("photo_page_exspore", {
        photo_page_exspore_time: pageTime,
        photo_page_exspore_indesktop_time: totalDeskTopPhotoTime
    })
}

//Video
function trackfinishLoadVideoTime() {
    if (isVideoShow) {
        return;
    }
    isVideoShow = true;
    totalDeskTopVideoTime = 0;
    finishLoadVideoDate = (+new Date());
    lastVideoFrontDate = (+new Date());
}
function trackUnInstallVideoTime() {
    isVideoShow = false;
    var pageTime = +new Date() - finishLoadVideoDate;
    totalDeskTopVideoTime = totalDeskTopVideoTime + (+new Date() - lastVideoFrontDate);
    lastVideoFrontDate = (+new Date());
    track("video_page_exspore", {
        video_page_exspore_time: pageTime,
        video_page_exspore_indesktop_time: totalDeskTopVideoTime
    })
}
//doc
function trackfinishLoadDocTime() {
    if (isDocShow) {
        return;
    }
    isDocShow = true;
    totalDeskTopDocTime = 0;
    finishLoadDocDate = (+new Date());
    lastDocFrontDate = (+new Date());
}
function trackUnInstallDocTime() {
    isDocShow = false;
    var pageTime = +new Date() - finishLoadDocDate;
    totalDeskTopDocTime = totalDeskTopDocTime + (+new Date() - lastDocFrontDate);
    lastDocFrontDate = (+new Date());

    track("document_page_exspore", {
        document_page_exspore_time: pageTime,
        document_page_exspore_indesktop_time: totalDeskTopDocTime
    })
}

//file
function trackfinishLoadFileTime() {
    if (isFileShow) {
        return;
    }
    isFileShow = true;
    totalDeskTopFileTime = 0;
    finishLoadFileDate = (+new Date());
    lastFileFrontDate = (+new Date());
}
function trackUnInstallFileTime() {
    isFileShow = false;
    var pageTime = +new Date() - finishLoadFileDate;
    totalDeskTopFileTime = totalDeskTopFileTime + (+new Date() - lastFileFrontDate);
    lastFileFrontDate = (+new Date());

    track("file_page_exspore", {
        file_page_exspore_time: pageTime,
        file_page_exspore_indesktop_time: totalDeskTopFileTime
    })
}

//Upload
function trackfinishLoadUploadTime() {
    if (isUploadShow) {
        return;
    }
    isUploadShow = true;
    totalDeskTopUploadTime = 0;
    finishLoadUploadDate = (+new Date());
    lastUploadFrontDate = (+new Date());
}
function trackUnInstallUploadTime() {
    isUploadShow = false;
    var pageTime = +new Date() - finishLoadUploadDate;
    totalDeskTopUploadTime = totalDeskTopUploadTime + (+new Date() - lastUploadFrontDate);
    lastUploadFrontDate = (+new Date());

    track("xingji_transfer_page_exspore", {
        xingji_transfer_page_exspore_time: pageTime,
        xingji_transfer_page_exspore_indesktop_time: totalDeskTopUploadTime
    })
}

function countPreUpload() {
    preUploadCount++;
}

function countUploadedSucces() {
    uploadedSuccess++;
    tryTrackUploadFile();
}

function countUploadedFail() {
    upoladedFail++;
    tryTrackUploadFile();
}
function setUploadWay(way) {
    console.log("way=" + way);
     uploadWay = way;
}

function tryTrackUploadFile() {
    if (preUploadCount == uploadedSuccess + upoladedFail) {
        track("transfer_ducument", {
            transfer_ducument_way: uploadWay,
            transfer_ducument_count: preUploadCount,
            succcess_transfer_ducument_result: uploadedSuccess,
            fail_transfer_ducument_result: upoladedFail
        });
        preUploadCount = 0; 
        uploadedSuccess = 0;
        upoladedFail = 0;
        setUploadWay(0);
    }
}