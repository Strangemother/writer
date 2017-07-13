# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-24 22:52
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('filename', models.CharField(blank=True, max_length=255, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Page',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('created', models.TimeField(auto_now_add=True)),
                ('updated', models.TimeField(auto_now=True)),
                ('child_of', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='markdown.Page')),
            ],
        ),
        migrations.CreateModel(
            name='PageContent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text_content', models.TextField()),
            ],
        ),
        migrations.AddField(
            model_name='page',
            name='contents',
            field=models.ManyToManyField(null=True, to='markdown.PageContent'),
        ),
        migrations.AddField(
            model_name='book',
            name='pages',
            field=models.ManyToManyField(null=True, to='markdown.Page'),
        ),
    ]
