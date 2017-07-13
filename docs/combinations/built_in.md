# shortcut

Built-in  commands can yield the same operations as `Combinations`- but a built-in has all the options baked into smaller commands.

Generate the `model`, `admin`, `view` and `templates` using a standard (but extensive) combination:

```
$. boiler make model-admin-view-templates poll
    --model MyModel OtherModel
    --admin MyModel
    --view  my_view.status(201) detail(poll_id).render
```

This readable but quite a mouthful we can cut this down:

```
$. boiler make mavt poll MyModel OtherModel | MyModel | - | my_view.status(201) detail(poll_id).render
```

This short performs exactly the same. The command `mavt` is the first letter of each command as one string. Luckily our commands have unique initial letters. This may read `mvatu`; for `model`, `view`, `admin`, `templates`, `urls` in order.

The `--switch` arguments are replaced with an inline string with a pipe `|` delim. For any omitted attributes, apply one or less inert characters in place of the commands.

In this example our `templates` command receives no inline arguments. In this case a dash "`| - |`" between two pipes is a neat replacement. This could also read "`||`" or "`| ? |`" or anything really.

be careful not to apply a command of which is parsed by your command.If in doubt, add a zero `| 0 |` - It's a very accepted character.

_verbose void all commands_
```
$. boiler make mavt poll | 0 | 0 | 0 | 0 |
```

You could write this, but it's not required.

+ The first pip after you app is optional

    ```
    $. boiler make mavt poll MyModel | 0 | 0 | 0 |
    ```

+ and remainder `| 0 ..` can be omited

    In this case, we only provide the view; a `detail` method accepting poll_id:

    ```
    $. boiler make mavt poll | 0 | 0 | detail(poll_id) | 0 |
    ```

    So we can write it like:

    ```
    $. boiler make mavt poll 0 | 0 | detail(poll_id)
    ```

+ Change the zero `0` to any `int`, to _pad 0_ the given count

    In this we perform default for model, admin, view, and one template called "my_view"

    ```
    $. boiler make mavt poll 0 | 0 | 0 | my_view.render
    ```

    So we can rewrite this:

    ```
    $. boiler make mavt poll 3 | my_view.render
    ```
