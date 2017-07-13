# contrib

Merging the builtins and extending templates, we can assign a method of assigning packages of baked contributions.

For example, we can create templates for an existing views and include a package of `jQuery` JS:

This will pick up the views from the `polls` app and generate the correct views:

```
$. boiler make templates polls
```

We can add static content such as jQuery and MaterializeCSS

```
$. boiler make templates polls --static-pkg jquery materialize
```

The static packages applied will:

+ Create a `static/` folder within `poll/` directory
+ Create `css/`, `js/` and any other relevent folders
+ Copy all assets into the correct static locations
+ Apply the statics to `settings.py` if required.
+ write the templates based on `polls.views`
+ Add additional HTML to and `load static` the required assets

You can write this command into a static-package and perform this command as a single command, using the static-package on other projects later.

### Using static page

The `material-vue` static page provides

+ MaterializeCSS
+ jQuery
+ vue.js
+ google fonts
+ any HTML

We can run this command through the `boiler`, providing standard arguments and overriding any baked argument from the static-package.

In this example, we can omit the google fonts, as this package allows the `--ignore-asset` flag

```
$. boiler make template.material-vue polls --ignore-assets fonts
```

Combine this with other commands

```
$. boiler make model/view/template.material-vue polls --ignore-assets fonts
```

Wraping this up into the short syntax required some tugging. It exists but it's probably not the best method.


```
$. boiler make mvt polls --ignore-assets fonts --t-make/material-vue
```

The `--t-` apples the next statement `make` to the run routine of `templates` make function.

the `m` for `make is applied to boiler and a command argument

```
$. boiler m mvt polls --ignore-assets fonts --t-m/material-vue
```

expanded
```
$. boiler make model-view-templates polls --ignore-assets fonts --templates-make/material-vue
```

Another example:

```
$. boiler make model-admin-view-urls-templates poll
    --model MyModel OtherModel
    --admin MyModel
    --view  my_view.status(201) detail(poll_id).render
    --ignore-assets fonts
    --templates-make/material-vue
```

Can be shortened to

```
$. boiler m mavut poll MyModel OtherModel
    | MyModel
    | my_view.status(201) detail(poll_id).render
    --t-m/material-vue
    --ignore-assets fonts
```
