import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Button } from "react-native";
import { useRoute } from '@react-navigation/native';

import { getFormattedDate } from "../../util/date";
import { KolorKit } from "../../constants/styles";
import Input from "../ui/Input";

import { ValueContext } from "../../store/value-context";
import { fetchValues, getValue } from "../../util/http";



export default function ValueForm({onSubmit, defaultValues}) {
    const route = useRoute();

    const dataCtx = useContext(ValueContext);
    const { email, setValues } = dataCtx;

    const editedValueId = route.params?.valueId;
    const [fethedValueData, setFethedValueData] = useState(null);

    const [inputs, setInputs] = useState({
        name: {
            value:
            fethedValueData
                ? fethedValueData.name
                : defaultValues
                    ? defaultValues.name
                    : 'User',
            isValid: true,
        },
        date: {
            value:
            fethedValueData
                ? fethedValueData.date
                : defaultValues
                    ? getFormattedDate(defaultValues.date)
                    : '',
            isValid: true,
        },
    });


    useEffect(() => {
        async function getValues() {
            try {
                const values = await fetchValues(dataCtx.uid);
                setValues(values);
            } catch (error) {
                console.error('Could not get values. ', error);
            }
        }
        getValues();
    }, []);

    useEffect(() => {
        async function fetchValueData() {
            try {
                const valueContent = await getValue(dataCtx.uid, editedValueId);
                setFethedValueData(valueContent);
            } catch (error) {
                console.error('Could not fetch value data. ', error);
            }
        }
        fetchValueData();
    }, [editedValueId]);

    useEffect(() => {
        setInputs((curInputs) => ({
            ...curInputs,
            name: {
                value: fethedValueData ? fethedValueData.name : curInputs.name.value,
                isValid: true,
            },
            date: {
                value: fethedValueData ? fethedValueData.date : curInputs.date.value,
                isValid: true,
            },
        }));
    }, [fethedValueData]);


    function inputChangedHandler(inputIdentifier, enteredValue) {
        setInputs((curInputs) => {
            return {
                ...curInputs,
                [inputIdentifier]: {value: enteredValue, isValid: true},
            };
        });
    }

    function submitHandler() {
        const valueData = {
            name: inputs.name.value,
            date: inputs.date.value === '' ? null : new Date(inputs.date.value),
            email: email,
        };

        const nameIsValid = valueData.name.trim().length > 2;
        const dateIsValid = valueData.date === null || valueData.date.toString() !== 'Invalid Date';

        if (!dateIsValid || !nameIsValid) {
            let errorMessage = '';
            if (!nameIsValid) {
                errorMessage += 'Name input must have more than 2 symbols.\n';
            }
            if (!dateIsValid) {
                errorMessage += 'Invalid date format. Please use DD-MM-YYYY.\n';
            }

            Alert.alert('Input value is invalid!', errorMessage.trim(), [
                {
                    text: 'Okay',
                    onPress: () => setInputs((curInputs) => ({
                        ...curInputs,
                        name: nameIsValid ? curInputs.name : '',
                        date: dateIsValid ? curInputs.date : '',
                    })),
                }
            ]);

            setInputs((curInputs) => {
                return {
                    ...curInputs,
                    name: {value: curInputs.name.value, isValid: nameIsValid},
                    date: {value: curInputs.date.value, isValid: dateIsValid},
                };
            });
            return;
        }
        // console.log(inputs);
        onSubmit(valueData);
    }

    const formIsInvalid = !inputs.date.isValid || !inputs.name.isValid;



    return (
        <View style={styles.form}>
            <Input
                invalid={!inputs.name.isValid}
                textInputConfig={{
                    autoCorrect: false,
                    autoCapitalize: "none",
                    maxLength: 32,
                    autoComplete: "off",
                    placeholder: "Name",
                    onChangeText: inputChangedHandler.bind(this, 'name'),
                    value: inputs.name.value,
                }}
            />
            <Input
                invalid={!inputs.date.isValid}
                textInputConfig={{
                    keyboardType: 'numeric',
                    autoCorrect: false,
                    autoCapitalize: "none",
                    maxLength: 10,
                    autoComplete: "off",
                    placeholder: "YYYY-MM-DD",
                    onChangeText: inputChangedHandler.bind(this, 'date'),
                    value: inputs.date.value,
                }}
            />
            {formIsInvalid && (
                <Text style={styles.errorText}>Invalid input value - Please check your entered data! Name input must have more than 3 symbols.</Text>
            )}
            <Button
                color={KolorKit.blackBlueTheme.yellow400}
                style={styles.btnConfirm}
                title="Confirm"
                onPress={submitHandler}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    form: {
        marginTop: 35,
    },
    btnConfirm: {
        width: '95%',
        alignSelf: 'center',
    },
    errorText: {
        textAlign: 'center',
        color: KolorKit.defaultColors.error500,
        margin: 8,
    },
});