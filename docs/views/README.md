# Views

Generate basic views for an existing app using string input or existing models

+ An app is required.

Create a view for an app. Any required fields not supplied with default `None`

Simple View: [Django Views reference](https://docs.djangoproject.com/en/1.10/topics/http/views/#a-simple-view)

```
boiler make view polls current_datetime, index_page
```

Creates:

```py
from django.http import HttpResponse

def index_page(request):
    name = 'index_page'
    html = "poll.views.{}".format(name)
    return HttpResponse(html)

def current_datetime(request):
    name = 'current_datetime'
    html = "poll.views.{}".format(name)
    return HttpResponse(html)
```

With template types, you can generate styles methods

```
$. boiler make view polls my_view.status(201) detail(poll_id).render
```

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
