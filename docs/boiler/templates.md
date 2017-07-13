# Templates

Generate basic templates for existing `views.py` views.

+ A views.py must exist to generate the templates

The template generator will create basic HTML templates for a target app and its views

```
$. boiler make template polls
```

The HTML file for each view in `views.py` is created in `polls/templates/` The name of the file will be the name of the given view.

In views.py:

```py
#...
def detail(request, poll_id):
    return render(request, 'polls/detail.html', {'poll': poll_id})
```

Template path `[BASE_DIR]/polls/templates/polls/details.html`. This a default path for the django `TemplateFinder` and should detect immediately.

### Target view

choose the specific view to generic a HTML file within `templates/` with the same name.

You can provide more than one.

```py
$. boiler make template polls my_view detail
```

In this example two templates will exist within the `[BASE_DIR]/polls/template/polls/` directory; `my_view.html` and `detail.html`. The contents of each file will contain a HTML base shape and the name of the target view:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>my_view</title>
</head>
<body>
{% block content %}
    <h1>Template: polls.my_view</h1>
{% endblock content %}
</body>
</html>
```

### Template Extending

You can choose to create a neater layout for your templates by generating a `base.html` with these each target view extending the base:

Provide the `--base` switch.
```py
$. boiler make template polls my_view detail --base
```

This will produce three files in the `[BASE_DIR]/polls/templates/polls` directory

+ base.html
+ polls.html
+ detail.html

`polls.html` and `details.html` will extend `base.html`.

The contents of `polls/base.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{% block page_title %}Base page{% endblock page_title %}</title>
</head>
<body>
{% block content %}
    base page
{% endblock content %}
</body>
</html>
```

the contents of `polls/detail.html`

```html
{% extends "polls/base.html" %}
{% block page_title %}Base page{% endblock page_title %}
{% block content %}
    <h1>Template: polls.detail</h1>
{% endblock content %}
```

You can provide another app to the `--base`switch. You `base.html` file will be create in the `templates/` directory of the `base`:

Given the directory structure of `django=admin startproject website`

```
+ BASE_DIR(website)
    + website/
        + settings.py
        + urls.py
    + polls/
        + views.py
            ( my_view, detail, )
        + models.py
        + templates/
    + blog/
        + views.py
            ( index_view, )
        + templates/
```

We generate a `[BASE_DIR]/website/templates/base.html` on many apps.

+ Force the creation of `templates/` in the `websites` app
+ Produce templates for many apps

```py
$. boiler make template polls.my_view polls.detail blog.index_view --base website
```


```
BASE_DIR(website)
    website/
        settings.py
        urls.py
        + templates/
            + base.html
    polls/
        views.py
            ( my_view, detail, )
        models.py
        templates/
            + polls/
                + my_view.html
                + detail.html
    blog/
        views.py
            ( index_view, )
        templates/
            + blog /
                + index_view.html
```


