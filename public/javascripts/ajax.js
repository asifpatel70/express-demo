$(document).ready(function(){
    $('.dltrecord').click(function(){ 
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type'); 
        swal({
            title: 'Are you sure1?',
            text: "Remove current record?",
            buttons: ["Cancel", "Delete"],
            }).then((userResponse)=> {
            if(userResponse){
                $.ajax({
                    url: "/"+type+"/delete", 
                    method: "delete",
                    data:{'id':id},
                    dataType:'json',
                    success: function () {
                      //swal("Deleted!", "Successfully deleted", "success");
                      location.reload();
                    }
                    
                });
            }
        })
    });
    $(function(){
        $("#datepicker").datepicker({
            format: "yyyy-mm-dd",
          });
        $("#datepicker1").datepicker({
            format: "yyyy-mm-dd",
        });
    });
    tinymce.init({
        selector: 'textarea#inpudescription',
        menubar: false
      });
    $(document).on('click','#remove',function(event) {
        event.preventDefault();
        $('#image_edit').val('');
        $('#preview_container').addClass('d-md-none');
        $('#remove').addClass('d-md-none');
        $('#preview').attr('src', '');
        $("#preview").remove();
    });
    // $('.exportRecords').click(function(){ 
    //     var type = $(this).attr('data-type'); 
    //     $.ajax({
    //         url: "/"+type+"/export", 
    //         method: "post",
    //         dataType:'json',
    //         success: function () {
    //           swal("Download", "Successfully download", "success");
    //         }
            
    //     });
    // });    
});