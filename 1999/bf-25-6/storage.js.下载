/***** name:localStorage的key* data:localStorage的Value* expire:localStorage的过期时间,默认是1天后过期****///设置缓存
const localStorageSet = (name, data, expire ) => {
    let time= new Date().getTime() + expire * 60 * 60 * 1000;
  const obj = {
    data,
    time
  };
  localStorage.setItem(name, JSON.stringify(obj));
};

//读取缓存
const localStorageGet = name => {
  const storage = localStorage.getItem(name);
  const time = new Date().getTime();

  let result = {};
  if (storage) {
    const obj = JSON.parse(storage);
    if (time <obj.time) {
      result = obj.data;
    } else {
      localStorage.removeItem(name);
    }
  }
  return result;
};

//loading 
var loadingTime=3;
var progress=0;



let loadData=localStorageGet("loading");
    
if(loadData==1){
    $("#loading").hide();
    // $(".firstMobile-2").show();
    $(".firstMobile-1").show(); 
    $("#kvMobile").show();
}else{
    $("#loading").show(); 
    var progressNum=setInterval(function(){
        progress++;
        $(".loadingProgress").html(progress);
        if(progress==100){
            clearInterval(progressNum);
            $("#loading").css("opacity",0);
           
            setTimeout(function(){
                $("#loading").hide();
                $("#kvMobile").show();
            },300);
            setTimeout(()=>{
                $(".firstMobile-2").show();
                $(".firstMobile-1").show();
            },600)
            //localStorage.setItem("loading",1);
            localStorageSet("loading",1,24)
        }
    },100/loadingTime);
}