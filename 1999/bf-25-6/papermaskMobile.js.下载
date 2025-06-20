function paperShowBigM(e) {
  //console.log(e,6666)
  $("#papermaskDetailTop-zoom-mobile").prop("src", e.src);
  $(".papermaskMobileDetail").show();
  $(".papermaskMobileDetail").removeClass("animate__fadeOutDown");
  $(".papermaskMobileDetail").addClass("animate__fadeInUp");
}
function hidePaperBigM() {
  if (true) {
    $(".papermaskMobileDetail").removeClass("animate__fadeInUp");
    $(".papermaskMobileDetail").addClass("animate__fadeOutDown");
    setTimeout(() => {
      $(".papermaskMobileDetail").hide();
    }, 300);
  }
}
let isLoadingM = true;
let imgArrM = [];
function getDataM(params) {
  isLoadingM = true;
  getPictureList(params).then(async (res) => {
    if (res.pageData.length === 0) {
      isLoadingM = true;
      return;
    }
    res.pageData.map((v) => {
      imgArrM.push(v.pictureUrl);
    });
    console.log(6666666666);
    // 开始渲染
    imgLoadM();
    // 注册下拉加载
    loadMoreM(
      {
        el: "#papermaskMobile", // 滚动元素
        offset: 200, // 距离底部偏移量，达到即可触发
      },
      () => {
        params.current = params.current + 1;
        getNewDataM(params);
      }
    );
  });
  imgArrM.map((v, index) => {
    let str = `
            <div class="papermask-mid-list-mobile animate__animated animate__fadeInUp">
                    <img src="${v}" alt="" onclick="paperShowBigM(this)">
                    </div>`;
    if (index < 6) {
      if (index % 2) {
        $(".papermask-mid-mobile-r").append(str);
      } else {
        $(".papermask-mid-mobile-l").append(str);
      }
    }
  });
}
function paperRenderM() {
  let params = { current: 1, pageSize: 10 };
  getDataM(params);
}
function getNewDataM(params) {
  imgArrM = [];
  currentImgM = 0;
  isLoadingM = true;
  getPictureList(params).then((res) => {
    if (res.pageData.length === 0) {
      isLoadingM = true;
      return;
    }
    res.pageData.map((v) => {
      imgArrM.push(v.pictureUrl);
    });
    imgLoadM();
  });
}
function getShortM() {
  var height0 = $(".papermask-mid-mobile-l").height();
  var height1 = $(".papermask-mid-mobile-r").height();

  switch (Math.min(height0, height1)) {
    case height0:
      return "papermask-mid-mobile-l";
      break;
    case height1:
      return "papermask-mid-mobile-r";
      break;
  }
}
var currentImgM = 0;
function imgLoadM() {
  console.log("渲染中...");
  let img = new Image();
  console.log(currentImgM, imgArrM.length, 5555);
  if (currentImgM < imgArrM.length) {
    isLoadingM = true;
    let imgTu = `
      <div class="papermask-mid-list-mobile animate__animated animate__fadeInUp">
        <img src="${imgArrM[currentImgM]}" alt="" onclick="paperShowBigM(this)">
      </div>
    `;
    img.onload = () => {
      $(`.${getShortM()}`).append(imgTu);
      imgLoadM();
    };
    img.onerror = () => {
      $(`.${getShortM()}`).append(imgTu);
      imgLoadM();
    };
    img.src = imgArrM[currentImgM];
    currentImgM++;
  } else {
    console.log(getShortM(), "此时最小高度的列");
    console.log("渲染完成!");
    isLoadingM = false;
    return;
  }
}

// 滚动底部加载
function loadMoreM(obj, fn) {
  let minScrollHeight = `.${getShortM()}`;
  $(obj.el).scroll(function () {
    var scrollTop = $(this).scrollTop(); // 滚轮滚动的距离
    var windowHeight = $(this).height(); // 网页的显示区域的高度
    var scrollHeight = $(minScrollHeight).height(); // 网页的总高度
    console.log(scrollTop + windowHeight, scrollHeight);
    if (scrollTop + windowHeight >= scrollHeight - obj.offset) {
      console.log(fn && !isLoadingM, "滚动到底部了");
      fn && !isLoadingM && fn();
    }
  });
}
