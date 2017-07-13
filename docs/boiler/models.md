# Models


## Models

Generate basic models within your models.py

+ **Required** The target app should exist

 ```
django manage.py startapp polls
```

You can generate models for a new or existing `models.py`. If the model exists, it's skipped unless updated.

```
$. boiler make models app[, model model ...]
```

With model switch

```
$. boiler make models app [--models|-m model model ...]
```

In this example, we generate models `Poll`, `Other` and `Person` for the `polls` app. The `Person` class extends another model `Visitor` from the pretend app `mertics`

Name the new models and assign ancestors using a cheap string style


```
$. boiler make models polls, Poll Other Person(metrics.Visitor)
```

notice the comma after the app "polls,", this denotes the next set of arguments are model names. You can generate the same models on many apps

```
$. boiler make models polls metrics, GenericModel, BaseModel
```
