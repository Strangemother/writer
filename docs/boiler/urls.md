# URLS

Generate a basic urls.py for a target app.

+ **Required** The target app needs `views.py` with _class based_ views.

generate a `urls.py` for an installed app. a url for all classes and methods are applied to a url_pattern

```
$. boiler make urls polls
```

Include the urls of an app in your root app.

In this example, we have our main application `website` serving `settings.py` and the main `urls.py`.

The command will create an `include()` within `websites.urls` referencing `polls.urls` with url pattern `url(r'polls/', include('polls.urls'))`

```
$. boiler make urls website include polls
```

Alter the url path with the `--path` switch. In this example. In this example we change the defualt `polls/` to `user-polls/'

```
$. boiler make urls website include polls -- user-polls/
```

Target the root slash `/`, dollar `$` or an empty string `""` in the same manner. There is no magic, it's a literal string.

```py
$. boiler make urls website include polls --
# url(r'', include('polls.urls'))
```

```py
$. boiler make urls website include polls -- /
# url(r'/', include('polls.urls'))
```

```py
$. boiler make urls website include polls -- ^$
# url(r'^$', include('polls.urls'))
```
