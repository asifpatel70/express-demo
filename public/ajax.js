$(document).ready(function(){
    $('.dltrecord').click(function(){ 
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type'); 
        swal({
            title: 'Are you sure?',
            text: "Remove current element?",
            buttons: ["Cancel", "Delete"],
            }).then((userResponse)=> {
            if(userResponse){
                $.ajax({
                    url: "/"+type+"/delete", 
                    method: "delete",
                    data:{'id':id},
                    dataType:'json',
                    success: function () {
                      swal("Deleted!", "Successfully deleted", "success");
                    }
                });
            }
        })
        location.reload();
    });
});