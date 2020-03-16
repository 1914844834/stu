var apiUrl = "http://127.0.0.1:6060/kbms";


var noneContent = ["很抱歉小精灵没明白大侠的问题，您可以尝试换一种问法"];
var tlContent = "亲爱的玩家，小精灵去学习更多的知识去了，请您耐心等待小精灵的归来~~~~";
var direction = -1;	//默认向下
var top10Str = "";
var top5Str="";

var txtFocusFlag = true;
var satisWord = "感谢您的评价!";
var tips="";
$(function(){
	sorryWord = "很抱歉没能帮助您解决问题，精灵一定会好好学习，天天向上......您可以继续提问或者点击进行咨询";
	$("[name=question_in_box]").focus();
	$(document).keydown( function(event) {
		if (event.keyCode == 13) {
			doSearchQuestion();
		}
	});

	  $("body").delegate(".pop_a a","click",function(){
		      if(this.href == 'about:blank' || this.href == 'javascript:void(O)') {
		          var text = $(this).text()
		          $("[name='question_in_box']").val(text)
		          $("[name='question_in_box']").focus()
		          doSearch(text);
		  		  $("[name='question_in_box']").val("")
		          return false
		      }
		  });

	//添加常见问题

	var commonQuestionUrl = apiUrl + "/question/top5";
	$.getJSON(commonQuestionUrl, function(data) {
		$("#right_question_list").empty();
        $(data.data).each(function(index) {
        	if(index<10){
	        	top10Str += "<li>";
	        	top10Str += "<a href=\"javascript:doSearchTop5("+ '\'' +  data.data[index].title + '\'' +")\" title=\""+data.data[index].title+"\">";
	        	top10Str += data.data[index].title;
	        	top10Str += "</a>";
	        	top10Str += "</li>";
        	}

        });
        $("#right_question_list").append(top10Str);

      //此处添加首回复的TOP5
        $(data.data).each(function(index) {
        	if(index<5){
        		top5Str += "<li>";
        		top5Str += "<a href=\"javascript:doSearchTop5("+'\'' +  data.data[index].title + '\''+")\" title=\""+data.data[index].title+"\">";
        		top5Str += "【"+(index+1)+"】"+data.data[index].title;
        		top5Str += "</a>";
        		top5Str += "</li>";
        	}
        });
        $("#top5Id").append(top5Str);

	});

});
	//自动完成


function doSearchTop5(e) {
	doSearch(e);
}

function doSearchQuestion() {
	var question = $.trim($("[name=question_in_box]").val());
	if( txtFocusFlag == false ) {
		question = "";
	}
	$("[name=question_in_box]").val("");

	safeQuestion = html_encode(question);
	if (!checkQuestion(safeQuestion)) {
		return false;
	}

	doSearch(safeQuestion);
}

function html_encode(str)
{
  var s = "";
  if (str.length == 0) return "";
  s = str.replace(/&/g, "&gt;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  //s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/\'/g, "&#39;");
  s = s.replace(/\"/g, "&quot;");
  s = s.replace(/\n/g, "<br>");
  return s;
}
var ques="";
function doSearch(question) {
	ques=question;

	var val = $("[name=spirit_url_type]").val();
	var msg = "";
	var url = "";
	appendUserInput(question);
	question= encodeURI(question);
	url = "http://localhost:6060/kbms/question/search?keyword="+question;
	$('.lenovo').hide()
	var feelUseful ="${sessionScope.feelUseful}";
	//执行搜索
	$.ajax({
		type:"get",
		url:url,
		cache:false,
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
		success:function(data,textStatus,jqXHR) {
			var answer = data.data;
			msg+= answer.title;
			msg += "</br></br>"
			msg += answer.content;
			appendAnswer(msg);   //显示答案
			var resultId = answer.id; //用于满意度评价
			var questionIdTagSize = $("input[name=question_id_hidden]").length;

			var problemDiv1 = $('<div class="problemDiv1"></div>');// 用来存不满意原因
			var problemDiv = $('<div class="problemDiv"></div>'),
				resultStr="",
				inputHidden = $('<input type="hidden" name="question_id_hidden"/>');

			if(answer.id && answer.id != '0'){
                var clearfix = $('<div class="manel_service_evalue clearfix" name="manel_service_evalue_box"></div>')

                resultStr += "<div class=\"evalueDiv\">";
                resultStr += "<p>小精灵的回答是否有用?</p>";
                resultStr += "<a href=\"javascript:feedback(1,"+questionIdTagSize+",'"+resultId+"',"+question+")\" class=\"icon_btn btns_bad\" id=\"btns_bad\">";
                resultStr += "<span class=\"icon_btn\">没用</span>";
                resultStr += "</a>";
                resultStr += "<a href=\"javascript:feedback(2,"+questionIdTagSize+",'"+resultId+"','"+question+"')\" class=\"icon_btn btns_general\" name=\"\" id=\"btns_general\">";
                resultStr += "<span class=\"icon_btn\">有用</span>";
                resultStr += "</a>";
                resultStr += "</div>";
                // resultStr += "<div class=\"problemDiv\"></div>";
                clearfix.append(resultStr)
				//clearfix.append("<br>")
                clearfix.append(problemDiv)
				clearfix.append(problemDiv1)
                clearfix.append(inputHidden)

                $(".left_bot").append(clearfix);

			}else {
				var clearfix = $('<div class="manel_service_evalue clearfix"></div>')
                clearfix.append(problemDiv);
				clearfix.append(problemDiv1)
                $(".left_bot").append(clearfix);

			}

            if(answer.relateArticle && answer.relateArticle.length > 0){

				//相关问题推荐
				var page_head = $('<div class="page_head right_title"></div>'),
					h3 = $('<h3></h3>'),
					ul = $('<ul class="question_list"></ul>'),
					problem = ''

                $(answer.relateArticle).each(function(index) {
						problem += "<li>";
						problem += "<a href=\"javascript:doSearchTop5("+'\'' +  answer.relateArticle[index].title + '\''+")\" title=\""+answer.relateArticle[index].title+"\">";
						problem += answer.relateArticle[index].title;
						problem += "</a>";
						problem += "</li>";
                });
				//problem += "<br>";
                ul.append(problem);
				h3.html('相关问题推荐：')
                page_head.append(h3)

                problemDiv.append(page_head)
                problemDiv.append(ul)
       		}
			else{
				problemDiv.append('  ');
			}
			var questionIdTagList = $("input[name=question_id_hidden]");   //获取存放result id 的hidden标签
			var thisQuestionIdTag = questionIdTagList.eq(questionIdTagSize);   //获取当前result 的存放 result id 的hidden标签
			thisQuestionIdTag.val(resultId);    //将result id 存放在当前hidden标签中
		},
		error:function(XMLHttpRequest,textStatus,jqXHR)
		{
			appendAnswer(tlContent);
			appendAnswer(noneContent[0]  + sorryWord + tips);   //显示错误信息
		}
	});
	goDown();
}

function appendUserInput(content){   //在用户方添加对话框
	var result="";
	result+="<dl class=\"private_chat clearfix\" >";
	result+="<dt class=\"face_riaght r\">";
	result+="<a href='javascript:void(0)'><img src='"+imgSrcUser+"' alt='亲，这个不能点哦' /></a>";
	result+="</dt>";
	result+="<dd class=\"r tar\">";
	result+="<span class=\"pop_a_user\">";
	result+="<span class=\"pop_b_user\">";
	result+="<span class=\"pop_c_user\">";
	result+="<span class=\"pop_d_user\">";
	result+=content;
	result+="</span>";
	result+="</span>";
	result+="</span>";
	result+="</span>";
	result+="</dd>";
	result+="</dl>";
	$(".left_bot").append(result);

}


function appendAnswer(content){    //在页面添加精灵方对话框
	var result="";
	result+="<dl class=\"private_chat clearfix\">";
	result+="<dt class='face_left l'><a href='javascript:void(0)'><img src='"+imgSrcServicer+"' alt='亲，这个不能点哦' /></a></dt>";
	result+="<dd class=\"l\">";
	result+="<span class=\"pop_a\">";
	result+="<span class=\"pop_b\">";
	result+="<span class=\"pop_c\">";
	result+="<span class=\"pop_d\">";
	result+=content;
	result+="</span>";
	result+="</span>";
	result+="</span>";
	result+="</span>";
	result+="</dd>";
	result+="</dl>";
	$(".left_bot").append(result);

}

function checkQuestion(question) {
	if (question == "") {
		var index = Math.floor(Math.random() * 5);
		appendUserInput("&nbsp;");
		appendAnswer("您输入的是空值，请检查一下！");  //显示错误信息
		goDown();
		return false;
	}
	return true;
}


function feedback(score,index,resultId,question) {
	console.log(question)
	var url = "http://localhost:6060/kbms/question/related";
	$.ajax({
	type: "post",
	data:{keyword:question,id:resultId},
	url: url,
	cache: false,
	dataType: "json",
	contentType:'application/x-www-form-urlencoded',
	success: function (data ,textStatus, jqXHR) {
		},
		error:function (XMLHttpRequest, textStatus, errorThrown) {
			alert("请求失败！")
		}
	});

	if (score == 2) {//有帮助

		if($("[name=manel_service_evalue_box]").eq(index).find('.problemDiv').html() == ''){
            $("[name=manel_service_evalue_box]").eq(index).hide("normal");
		}else {
            $("[name=manel_service_evalue_box]").eq(index).find('.evalueDiv').hide("normal");
		}
		appendAnswer(satisWord);
	} else {
        if($("[name=manel_service_evalue_box]").eq(index).find('.problemDiv').html() == ''){
            $("[name=manel_service_evalue_box]").eq(index).hide("normal");
        }else {
            $("[name=manel_service_evalue_box]").eq(index).find('.evalueDiv').hide("normal");

        }
	}
	goDown();
}

function goDown(){
	$(".left_bot").animate({scrollTop:10000000}, 1000);
}




