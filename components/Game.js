import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import base64 from 'base-64';
import image from '../assets/rocket3.png'
// Image by <a href="https://pixabay.com/users/NoHeart-12319532/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4159452">Angel Paredes Aldrete</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4159452">Pixabay</a>
import sky from '../assets/skybackground.png'
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';


class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            gameStart: false,
            submittedAns: 0,
            alreadyDisplayed: 0,
            allData: [],
            currentQ: '',
            answerChoices: [],
            answeredByPlayer: [],
            shuffled: '',
            points: 0,
            gameEnd: false,
        }
    }

    componentDidMount() { this.getData() }

    getData() {
        fetch(
            `https://opentdb.com/api.php?amount=15&category=17&difficulty=easy&type=multiple&encode=base64`
        )
            .then(response => response.json())
            .then(({ results }) => {
                this.setState({ allData: results })
            })
    }

    showQuestion() {
        const { allData, alreadyDisplayed } = this.state

        if (!allData || allData.length === 0) {
            this.getData()
        } else {
            const currentQ = base64.decode(allData[alreadyDisplayed].question)
            // console.log("Current Question:", currentQ)

            const choices = [...allData[alreadyDisplayed].incorrect_answers, allData[alreadyDisplayed].correct_answer]
            // choices.push(allData[alreadyDisplayed].correct_answer);

            let shuffled = shuffle(choices)

            const answerChoices = shuffled.map((choice, index) => ({
                label: base64.decode(choice),
                value: index,
            }))

            console.log("Answer Choices", answerChoices)

            //How to shuffle using Fisher-Yates Shuffle: https://bost.ocks.org/mike/shuffle/
            function shuffle(choices) {
                var m = choices.length, t, i;
                // While there remain elements to shuffle…
                while (m) {
                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);
                    // And swap it with the current element.
                    t = choices[m];
                    choices[m] = choices[i];
                    choices[i] = t;
                }
                return choices;
            }
            shuffle(choices)

            let correctAnswer = base64.decode(allData[alreadyDisplayed].correct_answer)

            console.log("Correct Answer:", correctAnswer)
            this.setState({ currentQ, answerChoices, gameStart: true })
        }
    }

    // ***** SCORING SECTION ******

    // Increase points by 1 if answer is correct. 
    onIncrement_correct = () => {
        this.setState({
            points: this.state.points + 1,
        })
    };

    // Do not increase or decrease points if answer is incorrect. 
    onIncrement_incorrect = () => {
        this.setState({
            points: this.state.points,
        })
    }

    handlePress = (submittedAns) => {
        this.setState({ submittedAns })
    }

    calcPoints = (submittedAns) => {
        const { alreadyDisplayed, allData } = this.state
        const currentQ = allData[alreadyDisplayed]

        if (this.state.answerChoices[submittedAns].label != base64.decode(currentQ.correct_answer)) {
            return this.onIncrement_incorrect() && console.log("You are WRONG!")
        } else if (this.state.answerChoices[submittedAns].label == base64.decode(currentQ.correct_answer)) {
            return this.onIncrement_correct() && console.log("You are RIGHT!")
        }
    }

    // ***** END OF SCORING SECTION ******

    moveToNext(final) {
        const { submittedAns, alreadyDisplayed, allData, answerChoices, answeredByPlayer } = this.state

        const currentQ = allData[alreadyDisplayed]

        const currentAnswer = {
            question: base64.decode(currentQ.question),
            submittedAns: answerChoices[submittedAns].label,
            correct_answer: base64.decode(currentQ.correct_answer),
            score: base64.decode(currentQ.correct_answer) === answerChoices[submittedAns].label,
        }

        this.calcPoints(submittedAns)

        answeredByPlayer.push(currentAnswer)

        this.setState({
            submittedAns: 0,
            answeredByPlayer: answeredByPlayer,
            alreadyDisplayed: alreadyDisplayed + 1,
        },
            () => (!final ? this.showQuestion() : this.lastPage())
        )
    }

    lastPage() {
        const { submittedAns } = this.state

        this.calcPoints(submittedAns)
        this.setState({
            gameEnd: true,
        })
    }

    restart() {
        this.setState({
            gameStart: false,
            submittedAns: 0,
            alreadyDisplayed: 0,
            allData: [],
            currentQ: '',
            answerChoices: [],
            answeredByPlayer: [],
            shuffled: '',
            points: 0,
            gameEnd: false,
        })
    }

    render() {
        const { submittedAns, currentQ, answerChoices, allData, alreadyDisplayed, points } = this.state

        if (this.state.gameStart == false) {
            return (
                <View >
                    <ImageBackground source={image} style={styles.image}>
                        <Text style={styles.gameTitle}>Science</Text>
                        <Text style={styles.gameTitle}>Genius</Text>

                        <Text style={styles.subtitle}>A science trivia challenge</Text>
                        <Button
                            title='Start Game'
                            onPress={() => this.showQuestion()}
                            titleStyle={{
                                color: "#FFFFFF",
                                fontSize: 22,
                                fontWeight: 'bold',
                            }}
                            buttonStyle={{
                                backgroundColor: '#215D98',
                                width: 200,
                                paddingVertical: 10,
                                marginBottom: 50,
                            }}
                        />
                    </ImageBackground>
                </View>
            )
        } else if (this.state.gameStart == true) {
            return (
                <View style={styles.container}>
                    <ImageBackground source={sky} style={styles.image}>
                        <Text style={styles.points}>Points: {points}</Text>


                        <Text style={styles.question}>{currentQ}</Text>
                        <RadioForm>
                            {answerChoices.map((obj, i) => (
                                <RadioButton key={Math.random()} >
                                    <RadioButtonInput
                                        obj={obj}
                                        index={i}
                                        isSelected={submittedAns === i}
                                        buttonSize={10}
                                        buttonOuterSize={20}
                                        onPress={this.handlePress}
                                        buttonInnerColor='#b44d7e'
                                        buttonOuterColor='#000'
                                    />
                                    <RadioButtonLabel
                                        obj={obj}
                                        index={i}
                                        labelHorizontal
                                        onPress={this.handlePress}
                                    />
                                </RadioButton>
                            ))}
                        </RadioForm>
                        <View>
                            {allData.length === alreadyDisplayed + 1 ? (

                                this.state.gameEnd == true ? (
                                    <View style={styles.scoreView}>
                                        <Text style={styles.gameOver}>Game Over</Text>
                                        <Text style={styles.score}>You scored {points} points out of 15!</Text>

                                        < Button
                                            onPress={() => this.restart()}
                                            title="Try again?"
                                            titleStyle={{
                                                color: "#FFFFFF",
                                                fontSize: 22,
                                                fontWeight: 'bold',
                                            }}
                                            buttonStyle={{
                                                backgroundColor: '#215D98',
                                                width: 300,
                                                marginTop: 15,
                                                paddingVertical: 15,
                                            }}
                                        />
                                    </View>

                                ) : (
                                        < Button
                                            onPress={() => this.lastPage()}
                                            title="Calculate Final Score"
                                            titleStyle={{
                                                color: "#FFFFFF",
                                                fontSize: 22,
                                                fontWeight: 'bold',
                                            }}
                                            buttonStyle={{
                                                backgroundColor: '#215D98',
                                                width: 300,
                                                marginTop: 15,
                                                paddingVertical: 15,
                                            }}
                                        />
                                    )

                            ) : (
                                    <Button
                                        onPress={() => this.moveToNext()}
                                        title="Submit Answer"
                                        titleStyle={{
                                            color: "#FFFFFF",
                                            fontSize: 22,
                                            fontWeight: 'bold',
                                        }}
                                        buttonStyle={{
                                            backgroundColor: '#215D98',
                                            width: 300,
                                            marginTop: 15,
                                            paddingVertical: 15,
                                        }}
                                    />
                                )
                            }
                        </View>
                        <Text style={styles.questionsRemaining}>Question: {(alreadyDisplayed + 1)}/15</Text>

                    </ImageBackground>

                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingBottom: 800,
    },
    image: {
        paddingTop: 250,
        paddingHorizontal: 30,
        paddingBottom: 500,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameTitle: {
        fontSize: 40,
        paddingHorizontal: 10,
        textAlign: 'center',
        fontWeight: '900',
    },
    subtitle: {
        color: '#eee',
        fontWeight: '900',
        fontSize: 20,
        marginVertical: 25,
    },
    scoreView: {
        backgroundColor: '#fff',
        marginTop: 20,
        paddingHorizontal: 40,
        paddingVertical: 30,
        opacity: 0.9,
    },
    gameOver: {
        fontSize: 30,
        textAlign: 'center',
        fontWeight: '700',
    },
    score: {
        color: '#b44d7e',
        fontWeight: '700',
        fontSize: 26,
        textAlign: 'center',
        paddingBottom: 5,
    },
    question: {
        fontSize: 18,
        marginHorizontal: 12.5,
        paddingBottom: 30,
        fontWeight: '700',
    },
    questionsRemaining: {
        color: '#152238',
        fontWeight: '700',
        fontSize: 14,
        marginTop: 20,
    },
    points: {
        color: '#152238',
        fontWeight: '700',
        fontSize: 18,
        marginVertical: 20,
    }
})

export default Game