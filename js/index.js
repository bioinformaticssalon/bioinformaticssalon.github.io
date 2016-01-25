$(document).ready(init_page);

function init_page(){
  console.log('foo');
  $('.otd-logo').click(function(){visit_page('http://otd.harvard.edu');});
  $('.dbmi-logo-block').click(function(){visit_page('http://dbmi.hms.harvard.edu');});
}

function visit_page(page){
  window.location=page;
}
