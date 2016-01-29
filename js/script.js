$(document).ready(init_page);

function init_page(){
  $('.otd-logo').click(function(){visit_page('http://otd.harvard.edu');});
  $('.dbmi-logo-block').click(function(){visit_page('http://dbmi.hms.harvard.edu');});
  $('.signup .frame1 .btn').click(signup_frame2);
  $('.signup .frame2 .btn.cancel').click(signup_frame1);
  $('.signup .frame2 .btn.addme').click(on_submit);
  $('.signup .frame3 .btn.ok').click(signup_frame1);
  init_dna();
}

function visit_page(page){
  window.location=page;
}

function init_dna(){
  var bases = ["A","G","C","T"];
  var frag = document.createDocumentFragment();
  for (var i = 0; i < 300; i++) {
    var item = document.createElement('span');
    var e = Math.floor(Math.random()*4);
    var base = bases[e];
    item.innerHTML = base;
    item.className += " " + base;
    frag.appendChild(item);
  }
  var dna = document.getElementById('dna');
  dna.appendChild(frag);
}

// signup form on meetings.html page

GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbx0kKc00sXf_itWJBb9aVaeEFn1WTLo-PwPcmP5dO92oBL819F8/exec';

function signup_frame1(){
  $('.signup .frame1').show(200);
  $('.signup .frame2').hide(200);
  $('.signup .frame3').hide(200);
  return false;
}

function signup_frame2(){
  $('.signup .frame2 input').val('');
  $('.signup .frame1').hide(200);
  $('.signup .frame2').show(200);
  $('.signup .frame3').hide(200);
  return false;
}

function signup_frame3(result){
  console.log('f3 result', result);
  $('.signup .frame1').hide(200);
  $('.signup .frame2').hide(200);
  if (result == 'success'){
    console.log('win', result);
    $('.signup .frame3 .success').show();
    $('.signup .frame3 .fail').hide();
  } else {
    console.log('lose', result);
    $('.signup .frame3 .fail').show();
    $('.signup .frame3 .fail .reason').html(result);
    $('.signup .frame3 .success').hide();
  }
  $('.signup .frame3').show(200);
  return false;
}

function validateEmail(email) {
  var re = /(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return re.test(email);
}

function on_submit(e){
  var email = $('form input#email').val();
  if (!validateEmail(email)){
    callback({result: '"' + email + '" doesn\'t seem to be a valid email address.'});
  } else {
    var data = {email: email, prefix: 'callback'};
    $.ajax({url: GOOGLE_URL,
	    errora: function(a, b, c){
	      var msg = 'Unable to connect. If the problem persists, please ';
	      msg += '<a href="mailto:' + ADMIN_EMAIL + '">contact us</a>.';
	      console.log('error', a, b, c);
	      signup_frame3(msg);
	    },
	  data: data,
	  jsonp: 'callback',
	  dataType: 'jsonp',
	  success: callback
	 });
    return false;    // e.preventDefault
  }
}

function callback(result){
  console.log('Callback result', result);
  var escaped = $("<div>").text(result.result).html();
  signup_frame3(escaped);
}

//-------------------
// Calendar

$(document).ready(get_calendar);

var CALENDAR = 'https://calendar.google.com/calendar/embed?src=strassmann.com_6m8slnmov4rqo0el43ftq7ha64%40group.calendar.google.com&ctz=America/New_York';

var CAL_ID = 'strassmann.com_6m8slnmov4rqo0el43ftq7ha64@group.calendar.google.com';
var KEY = 'AIzaSyCVQOLsT_TfacT9ze5zwQ5ahhA96fxWJPk';
var CAL_URL = 'https://www.googleapis.com/calendar/v3/calendars/'+CAL_ID+'/events?key='+KEY;

function get_calendar(){
  if ($('.events').length){
    $.ajax({url: CAL_URL, success: show_calendar});
  } else {
    console.log('nope');
  }
}

function show_calendar(result){
  var items = result.items;
  for (var i in items){
    var item = items[i];
    item.date_exp = create_date_exp(item);
  }
  items.sort(function(a,b){return a.date_exp.date - b.date_exp.date;});
  for (var j in items){
    var item = items[j];
    var title = item.summary;
    var ymd = item.date_exp.ymd;
    var yyyymmdd = ymd[0]+ymd[1]+ymd[2];
    var start = render_date(ymd);
    var link = CALENDAR+'&mode=month&dates='+yyyymmdd+'%2F'+yyyymmdd;
    var box = $('<div/>').addClass('event').append(start).append($('<a/>', {href: link}).text(title));
    $('.events').append(box);
  }
}

function pad(n) {
  return (n < 10) ? ("0" + n) : n.toString();
}

function create_date_exp(item){
  var start = item.start;
  if (start.date){
    var ymd = start.date.split('-');
    var d = new Date(ymd[0], ymd[1]-1, ymd[2]);
    return {ymd: ymd, date: d};
  } else {
    var d = new Date(Date.parse(start.dateTime));
    var ymd = [d.getFullYear().toString(), pad(1+d.getMonth()), pad(d.getDate())];
    var hm = [d.getHours(), d.getMinutes()];
    return {ymd: ymd, hm: hm, date: d};
  }
}


function render_date(ymd){
  var box = $('<div/>').text(ymd[1]+'/'+ymd[2]);
  return box;
}
