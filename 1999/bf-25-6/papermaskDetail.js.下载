var papermaskZoom = 1;
var paperData = [
  "./some/page/1.jpg",
  "./some/page/2.jpg",
  "./some/page/3.jpg",
  "./some/page/7.jpg",
  "./some/page/8.jpg",
  "./some/page/9.jpg",
  "./some/page/4.jpg",
  "./some/page/5.jpg",
  "./some/page/6.jpg",
];
function papermaskDetailChange(num) {
  if (num == 1) {
    papermaskZoom += 0.1;
  }
  if (num == -1) {
    papermaskZoom -= 0.1;
  }
  if (num == 0) {
    papermaskZoom = 1;
  }
  if (papermaskZoom > 2) {
    papermaskZoom = 2;
  }
  if (papermaskZoom < 0.1) {
    papermaskZoom = 0.1;
  }
  $(".papermaskDetailTop-zoom").css("transform", `scale(${papermaskZoom})`);
}
function papermaskDetailDown() {
  var a = document.createElement("a");
  a.href = $(".papermaskDetailTop-zoom")[0].src;
  a.download = `重返未来`;
  a.style.display = "none";
  a.click();
  //console.log($(".papermaskDetailTop-zoom")[0].src)
}
function paperShowBig(e, str) {
  if (str) {
    $("#papermaskDetailTop-zoom").prop("src", `./img/backstory/${str}`);
  } else {
    $("#papermaskDetailTop-zoom").prop("src", e.src);
  }
  papermaskZoom = 1;
  $("#papermaskDetail").show();
}
function paperShowHide() {
  papermaskZoom = 1;
  $(".papermaskDetail").removeClass("animate__fadeInUp");
  $(".papermaskDetail").addClass("animate__fadeOutDown");
  setTimeout(() => {
    $(".papermaskDetail").addClass("animate__fadeInUp");
    $(".papermaskDetail").removeClass("animate__fadeOutDown");
    $("#papermaskDetail").hide();
  }, 300);
}
let isLoadingPc = true;
let imgArr = [];
// 渲染初次5个
function getDataPc(params) {
  isLoadingPc = true;

  getPictureList(params).then((res) => {
    if (res.pageData.length === 0) {
      isLoadingPc = true;
      return;
    }
    //console.log(res,2);
    res.pageData.map((v) => {
      imgArr.push(v.pictureUrl);
    });
  });
  imgArr.map((v, index) => {
    let img = `
        <img src="${v}" alt="" data-mouse="mid" onclick="paperShowBig(this)" class="holder-img">
    `;
    if (index < 5) {
      $(`.p-${index % 5}`).append(img);
    }
  });
  setTimeout(() => {
    imgLoad();
  }, 1000);
}

function paperRender() {
  let params = { current: 1, pageSize: 15 };
  getDataPc(params);
  loadMore(
    {
      el: "#papermask", // 滚动元素
      // scrollHeight: ".papermask-mid", // 网页总高度 默认window
      offset: 0, // 距离底部偏移量，达到即可触发
    },
    () => {
      params.current = params.current + 1;
      getNewDataPc(params);
    }
  );
}
function getNewDataPc(params) {
  imgArr = [];
  currentImg = 0;
  isLoadingPc = true;
  getPictureList(params).then((res) => {
    if (res.pageData.length === 0) {
      isLoadingPc = true;
      return;
    }
    res.pageData.map((v) => {
      imgArr.push(v.pictureUrl);
    });
    imgLoad();
  });
}
function getShort() {
  var height0 = $(".p-0").height();
  var height1 = $(".p-1").height();
  var height2 = $(".p-2").height();
  var height3 = $(".p-3").height();
  var height4 = $(".p-4").height();
  switch (Math.min(height0, height1, height2, height3, height4)) {
    case height0:
      return "p-0";
      break;
    case height1:
      return "p-1";
      break;
    case height2:
      return "p-2";
      break;
    case height3:
      return "p-3";
    case height4:
      return "p-4";
      break;
  }
}
var currentImg = 0;
function imgLoad() {
  console.log("渲染中...");
  let img = new Image();
  if (currentImg < imgArr.length) {
    isLoadingPc = true;
    let imgTu = `
      <img src="${imgArr[currentImg]}" alt="" data-mouse="mid" onclick="paperShowBig(this)" class="holder-img">
    `;
    img.onload = () => {
      $(`.${getShort()}`).append(imgTu);
      imgLoad();
    };
    img.onerror = () => {
      $(`.${getShort()}`).append(imgTu);
      imgLoad();
    };
    img.src = imgArr[currentImg];
    currentImg++;
  } else {
    console.log("渲染完成!");
    isLoadingPc = false;
    return;
  }
}

// 滚动底部加载
function loadMore(obj, fn) {
  if (!obj.scrollHeight) obj.scrollHeight = window;
  $(obj.el).scroll(function () {
    var scrollTop = $(this).scrollTop(); // 滚轮滚动的距离
    var windowHeight = $(this).height(); // 网页的显示区域的高度
    var scrollHeight = $(obj.scrollHeight).height(); // 网页的总高度
    console.log(scrollTop, windowHeight, scrollHeight);
    if (scrollTop + windowHeight >= scrollHeight - obj.offset) {
      console.log(fn && !isLoadingPc, "滚动到底部了");
      fn && !isLoadingPc && fn();
    }
  });
}
