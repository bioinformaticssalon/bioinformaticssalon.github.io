$(document).ready(init_page);

function init_page(){
  $('.otd-logo').click(function(){visit_page('http://otd.harvard.edu');});
  $('.dbmi-logo-block').click(function(){visit_page('http://dbmi.hms.harvard.edu');});
  $('.signup .frame1 .btn').click(signup_frame2);
  $('.signup .frame2 .btn.cancel').click(signup_frame1);
  $('.signup .frame2 .btn.addme').click(signup_frame3);
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

function signup_frame1(){
  $('.signup .frame1').show(200);
  $('.signup .frame2').hide(200);
  $('.signup .frame3').hide(200);
  return false;
}

function signup_frame2(){
  $('.signup .frame1').hide(200);
  $('.signup .frame2').show(200);
  $('.signup .frame3').hide(200);
  return false;
}

function signup_frame3(){
  $('.signup .frame1').hide(200);
  $('.signup .frame2').hide(200);
  $('.signup .frame3').show(200);
  return false;
}
