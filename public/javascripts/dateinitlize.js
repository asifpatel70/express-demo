$(document).ready(function(){
    $(function(){
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        if(ca[0] == 'i18n=en'){
            $("#datepicker").datepicker({
                format: "dd-mm-yyyy",
            });
            $("#datepicker1").datepicker({
                format: "dd-mm-yyyy",
            });
        }else{
            $("#datepicker").datepicker({
                format: "dd.mm.yyyy",
              });
            $("#datepicker1").datepicker({
                format: "dd.mm.yyyy",
            });
        }
    });
});