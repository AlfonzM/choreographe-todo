var session = new QiSession();

var filter = '';

// Init
$(document).ready(function() {
    filter = 'today';
    loadTasks(filter);

    // Add new todo item
    $('form').submit(function () {
        var name = $('#taskname').val();
        var expirationDate = $('#expirationdate').val();

        if (name !== '' && expirationDate != '') {

            $.ajax({
                url: "http://localhost:8888/todo/api/tasks",
                type: 'POST',
                data: {'name':name, 'expiration_date':expirationDate},
                success: function(result){
                    // appendToList(JSON.parse(result));
                    loadTasks();

                    session.service("ALMemory").done(function (ALMemory) {
                        ALMemory.raiseEvent('TodoApp/AddTask', name);
                    });
                }
            });

            $('#taskname').val('');
            $('#expirationdate').val('');
        };

        return false;
    });

    // Delete todo item
    $('body').on('click', '.delete-task', function (e) {
        e.preventDefault();

        var idToDelete = $(this).parent().attr('data-id');

        $.ajax({
            url: "http://localhost:8888/todo/api/tasks/" + idToDelete + "/delete",
            type: 'GET',
            contentType: 'application/x-www-form-urlencoded',
            success: function(result){
                session.service("ALMemory").done(function (ALMemory) {
                    ALMemory.raiseEvent('TodoApp/DoneTask', idToDelete);
                });

                loadTasks();
            },
            error: function(result){
                alert("Error delete");
            }
        });
    });

    $('ul.links a').click(function (e) {
        $('ul.links a').removeClass('active');
        $(this).addClass('active');
    });

    $('#today-filter').click(function (e) {
        e.preventDefault();
        filter = 'today';
        loadTasks();
    });

    $('#weekly-filter').click(function (e) {
        e.preventDefault();
        filter = 'weekly';
        loadTasks();
    });

    $('#monthly-filter').click(function (e) {
        e.preventDefault();
        filter = 'monthly';
        loadTasks();
    });

    $('#all-filter').click(function (e) {
        e.preventDefault();
        filter = '';
        loadTasks();
    });
});

// Helper functions
function appendToList(task){
    var name = task.name;
    var id = task.id;
    var expirationDate = task.expiration_date;

    $('ul.tasks').append('<li data-id=' + id + '><a href="#" class="delete-task">Done</a><span class="task-text">' + name + '</span><span class="pull-right" style="color: #ccc">' + expirationDate + '</span></li>');
}

function loadTasks(){
    $.ajax({
        url: "http://localhost:8888/todo/api/tasks?q=" + filter,
        type: 'GET',
        success: function(result){
            $('ul.tasks').html('');

            var data = JSON.parse(result);

            if(data.length > 0){
                $.each(JSON.parse(result), function(i, obj) {
                    appendToList(obj);
                });
            } else {
                $('.tasks').html('<li class="text-muted text-center">No tasks found.</li>');
            }
        }
    });
}




// QiSessionオブジェクトの作成

session.service("ALMemory").done(function (ALMemory) {
    ALMemory.subscriber("HandLeftBackTouched").done(function(subscriber) {
        subscriber.signal.connect(remindTodayTasks);
    });
});


function remindTodayTasks() {
    // Tell pepper to remind tasks for today
    session.service("ALMemory").done(function (ALMemory) {
        ALMemory.raiseEvent('TodoApp/RemindTodayTasks', "today");
    });
}