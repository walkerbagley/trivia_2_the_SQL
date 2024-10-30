from rest_framework import serializers
from .models import *

class DeckQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeckQuestion
        fields = '__all__'

class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = '__all__'

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class HostDeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostDeck
        fields = '__all__'

class HostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Host
        fields = '__all__'

class QuestionAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAttribute
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = '__all__'

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'