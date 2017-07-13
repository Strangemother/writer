# Combinations

You can generate a a full suite of command using a combination.

```
$. boiler make view-urls polls
```

The combination of commands `views` then `urls` will perform on app `polls`

The combination can accept the same arguments as the single commands:

```
$. boiler make view polls my_view.status(201) detail(poll_id).render
```

_poll/views.py_
```py
from django.http import HttpResponse
from django.http import Http404
from django.shortcuts import render
from polls.models import Poll


def my_view(request):
    # Return a "created" (201) response code.
    return HttpResponse(status=201)

def detail(request, poll_id):
    result = {'poll_id': poll_id}
    template = 'polls/detail.html'
    return render(request, template, result)
```


_poll/urls.py_
```py
# URLconf
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^my-view/$', views.my_view),
    url(r'^detail/(?P<poll_id>+.)/$', views.detail),
]
```

## model-admin-view-template-url

You can get existed with `boiler` and all the commands to generate an entire sequence.

Each command wil run in order of left to right. Each command will receive the content from the previoud execution.

In this order, the `model` will provide `admin` with the correct models to work upon. The `view` can generate views using model data received through admin. The `template` receives the correct view content and finally the `urls` can read the information of `views`.

This giant chain can be shuffled to generate content in a different order. The generate content is given left to right by the previous command. if a command (such as `view`) does not receive the newly generated data, it may default to an existing cache.

_works_
```
$. python manage.py boiler make model/admin/view/template/url
```

_does not work_
```
$. python manage.py boiler make url/view/model/template
```

In the above error example, `view` will read the existing view data, not anything new the `model` command may have discovered. The same is applied for `url` - of which cannot read view or template information.

## Good commands

Generate the `views` and `urls`

```
$. boiler make view/urls polls
```

Generate the `model`, `admin`, `view` and `templates`

```
$. boiler make model-admin-view-templates poll MyModel OtherModel
    --admin MyModel
    --view  my_view.status(201) detail(poll_id).render
```

We can apply all the arguments the single command can receive. a command will receive arguments of the same name. the `admin` command receives `--admin` arguments and `view` receves `--view`.

The `model` arguments are `MyModel` and `OtherModel`. They are assigned inline, as the model is the first in the queue. Optionally you can provide a `--models MyModel OtherModel` switch, omiting any inline arguments.

Any missing arguments such as `templates` will default to the standard `boiler` settins, receiving updated information from the _left_ commands.
