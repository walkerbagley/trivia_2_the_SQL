# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

from trivia_2_api import manage


class DeckQuestions(models.Model):
    deck = models.OneToOneField('Decks', models.DO_NOTHING, primary_key=True)  # The composite primary key (deck_id, question_id) found, that is not supported. The first column is selected.
    question = models.ForeignKey('Questions', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'DeckQuestions'
        unique_together = (('deck', 'question'),)


class Decks(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.TextField()
    description = models.TextField()

    class Meta:
        managed = False
        db_table = 'Decks'


class Games(models.Model):
    id = models.UUIDField(primary_key=True)
    deck = models.ForeignKey(Decks, models.DO_NOTHING)
    host = models.ForeignKey('Hosts', models.DO_NOTHING)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Games'


class HostDecks(models.Model):
    host = models.OneToOneField('Hosts', models.DO_NOTHING, primary_key=True)  # The composite primary key (host_id, deck_id) found, that is not supported. The first column is selected.
    deck = models.ForeignKey(Decks, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'HostDecks'
        unique_together = (('host', 'deck'),)


class Hosts(models.Model):
    id = models.UUIDField(primary_key=True)
    host_name = models.TextField()
    hashed_password = models.TextField()

    class Meta:
        managed = False
        db_table = 'Hosts'


class QuestionAttributes(models.Model):
    question = models.OneToOneField('Questions', models.DO_NOTHING, primary_key=True)
    attribute = models.TextField()

    class Meta:
        managed = False
        db_table = 'QuestionAttributes'


class Questions(models.Model):
    id = models.UUIDField(primary_key=True)
    question = models.TextField()
    difficulty = models.SmallIntegerField()
    a = models.TextField(db_column='A')  # Field name made lowercase.
    b = models.TextField(db_column='B')  # Field name made lowercase.
    c = models.TextField(db_column='C', blank=True, null=True)  # Field name made lowercase.
    d = models.TextField(db_column='D', blank=True, null=True)  # Field name made lowercase.
    category = models.TextField()

    class Meta:
        managed = False
        db_table = 'Questions'


class Scores(models.Model):
    team = models.OneToOneField('Teams', models.DO_NOTHING, primary_key=True)  # The composite primary key (team_id, game_id) found, that is not supported. The first column is selected.
    game = models.ForeignKey(Games, models.DO_NOTHING)
    score = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'Scores'
        unique_together = (('team', 'game'),)


class TeamMembers(models.Model):
    team = models.OneToOneField('Teams', models.DO_NOTHING, primary_key=True)  # The composite primary key (team_id, user_id) found, that is not supported. The first column is selected.
    user = models.ForeignKey('Users', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'TeamMembers'
        unique_together = (('team', 'user'),)


class Teams(models.Model):
    id = models.UUIDField(primary_key=True)
    name = models.TextField()

    class Meta:
        managed = False
        db_table = 'Teams'


class Users(models.Model):
    id = models.UUIDField(primary_key=True)
    user_name = models.TextField()
    hashed_password = models.TextField()

    class Meta:
        managed = False
        db_table = 'Users'
