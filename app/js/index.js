$(document).ready(function() {
	$("#go-to-room").click(function(){
		var parsed_string = $('#go-to-room-input').val();
		parsed_string = parsed_string.toLowerCase().split(' ').join('-');
		document.location.href = "/"+parsed_string;
	});

	$("#go-to-room-input").keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			$("#go-to-room").click();
		}
	 
	});
});
