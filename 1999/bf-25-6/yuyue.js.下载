var loginMsg={};
loginMsg.osType=0;
function changeDevice(type){
    if(type=="ios"){
        loginMsg.osType=1;
        $(".android").removeClass("login-title-device");
        $(".ios").addClass("login-title-device");
    }else{
        loginMsg.osType=0;
        $(".android").addClass("login-title-device");
        $(".ios").removeClass("login-title-device");
    }
}
function agreeSelf(){
   $(".loginAgree-icon-g").toggle();  
}
function judgeAgree(){
    if($(".loginAgree-icon-g").is(":visible")){
        return true
    }else{
        alertShow("请先同意深蓝用户协议和隐私协议");
        return false
    }  
}
function loginButton(){
    console.log(11111)
    console.log($(".phone").val())
    if(!$(".phone").val()){       
        $(".phoneWaring").html("请输入手机号");
    }else{
        $(".phoneWaring").html(``);
    } 
    if(!$(".code").val()){
       $(".codeWaring").html("请输入验证码");
    }else{
        $(".codeWaring").html(``);
    }
    if(judgeAgree()&&$(".phone").val()&&$(".code").val()){
        loginMsg.phoneNo=$(".phone").val();
        loginMsg.captcha=$(".code").val();
        loginMsg.adParams=getXiaoMiCode();
        loginApi().then((res)=>{
            if(res.code==200){
                $(".loginLoading").hide();
                $(".inCode").hide();
               // judgeLogin();
            }  
        });  
    }
}
function alertShow(str){
    if(str){
        $(".allAlert-str").html(str)
    }
    $(".allAlert").show();
    setTimeout(()=>{
        $(".allAlert").hide();
    },1000)
}
function loginApi(){
    return new Promise((resolve, reject) => {
        $.ajax('/activity/m1/yuyue202107/subscribe',{
            type:"POST",
            dataType:"json",
            data:JSON.stringify(loginMsg),
            contentType:"application/json; charset=utf-8",
            success:(res)=>{
                console.log(res);
                if(res.code!=200){
                    alertShow(res.msg);
                    window.localStorage.removeItem("userInfo"); 
                }else{
                    yusShow(res.data.subscribeDuplicate)
                    
                    //window.localStorage.setItem("userInfo",encrypt(res.data))
                }
                resolve(res)
            },
            error:(err)=>{
                reject(err)
                alertShow(err)
            }
        })  
    })
    
}
function getPhoneCode(){
    $.ajax('/activity/m1/yuyue202107/captcha',{
        type:"POST",
        dataType:"json",
        data:JSON.stringify({
            phoneNo:loginMsg.phoneNo
        }),
        contentType:"application/json; charset=utf-8",
        success:(res)=>{
            console.log(res);
            if(res.code!=200){
               alertShow(res.msg) 
            }else{
                alertShow(`发送成功！`)
            }
        },
        error:(err)=>{
            alertShow(err)
        }
   }) 
}
function getCode(){
    if(!$(".phone").val()){
        $(".phoneWaring").html("请输入手机号");
    }else{
       $(".phoneWaring").html(``);
       if(checkModbile($(".phone").val())){
          loginMsg.phoneNo= $(".phone").val();
          showLimitTime();
          getPhoneCode();
       }
    }
}
showLimitTime("login");
function showLimitTime(type){  
    if(type){
        let time=window.localStorage.getItem("time");
        if(time){
             $(".login-code-time").show();
             $(".login-code-button").hide();
        }
        var codeTime=setInterval(()=>{
        time--;
        window.localStorage.setItem("time",time);
        $(".time-code").html(time);
        if(time<1){
            $(".login-code-time").hide();
            $(".login-code-button").show();
            clearTimeout(codeTime);
            $(".time-code").html(60);
            window.localStorage.removeItem("time");
         }
        },1000)
    }else{
        let time=60;
        $(".login-code-time").show();
        $(".login-code-button").hide();
        var codeTime=setInterval(()=>{
        time--;
        window.localStorage.setItem("time",time);
        $(".time-code").html(time);
        if(time<1){
            $(".login-code-time").hide();
            $(".login-code-button").show();
            clearTimeout(codeTime);
            $(".time-code").html(60);
            window.localStorage.removeItem("time");
         }
        },1000)
    } 
}
//JS使用正则表达式校验电话号码
function checkModbile(mobile) {
		var re = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
		var result = re.test(mobile); 
		if(!result) {
              $(".phoneWaring").html("手机号码格式不正确！");
			  return false;//若手机号码格式不正确则返回false
			}
		return true;
}
function closeImg(){
    $(".loading-yuyue").hide();
}
function closeImgAll(){
    //console.log(event.target.dataset.close)
   if(event.target.dataset.close=="yes"){
        $(".loading-yuyue").hide();
    } 
}
function showYuyue(){
    $(".loading-yuyue").show();
}
function yusShow(type){
    closeImg();
    $(".loading-yus").show();
    if(type){
        $(".yus-1").hide();
        $(".yus-2").show();
    }else{
        $(".yus-1").show();
        $(".yus-2").hide();    
    }
}
function hideYus(){
  //$(".loading-yus").hide();
  //console.log(event.target.dataset.close);
  if(event.target.dataset.close=="yes"){
    $(".loading-yus").hide();
  }  
}
function getXiaoMiCode(){
    let inCodeArr=window.location.href.split("?");
    let inCodeMap={};
    if(inCodeArr[1]){
        let dataAll=inCodeArr[1].split("&");
        dataAll.map(v=>{
        let apple=v.split("=");
        inCodeMap[apple[0]]=apple[1]  
        })
    }
     if(inCodeMap["bpsrc"]){
        return `bpsrc=${inCodeMap["bpsrc"]}`
     }else{
        return ''
     }
}