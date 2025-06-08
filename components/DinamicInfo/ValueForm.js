import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRoute } from '@react-navigation/native';
import useTheme from "../../hooks/useTheme";
import { KolorKit } from "../../constants/styles";

import { ensureDateFormat, parseDateString } from "../../util/birthdayDate";
import Input from "../ui/Input";

import { ValueContext } from "../../store/value-context";
import { getValue } from "../../util/http";

export default function ValueForm({onSubmit, defaultValues}) {
    const theme = useTheme();
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
                ? ensureDateFormat(fethedValueData.date)
                : defaultValues
                    ? ensureDateFormat(defaultValues.date)
                    : '',
            isValid: true,
        },
    });

    useEffect(() => {
        async function fetchValueData() {
            try {
                const valueContent = await getValue(dataCtx.uid);
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
                value: fethedValueData && fethedValueData.date 
                    ? ensureDateFormat(fethedValueData.date)
                    : curInputs.date.value,
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
        let dateObj = null;
        let dateIsValid = true;

        if (inputs.date.value && inputs.date.value.trim() !== '') {
            dateObj = parseDateString(inputs.date.value);
            dateIsValid = dateObj && !isNaN(dateObj.getTime());
        }

        const valueData = {
            name: inputs.name.value,
            date: dateIsValid ? dateObj : null,
            email: email,
        };

        const nameIsValid = valueData.name && typeof valueData.name === 'string' && valueData.name.trim().length > 1;

        if (!dateIsValid || !nameIsValid) {
            let errorMessage = '';
            if (!nameIsValid) {
                errorMessage += 'Name input must have more than 1 symbols.\n';
            }
            if (!dateIsValid) {
                errorMessage += 'Invalid date format. Please use DD.MM.YYYY or leave it empty.\n';
            }

            setInputs((curInputs) => {
                return {
                    ...curInputs,
                    name: {value: curInputs.name.value, isValid: nameIsValid},
                    date: {value: curInputs.date.value, isValid: dateIsValid},
                };
            });
            return;
        }
        onSubmit(valueData);
    }

    const formIsInvalid = !inputs.date.isValid || !inputs.name.isValid;

    const themedStyles = StyleSheet.create({
        form: {
            marginTop: 35,
        },
        btnConfirm: {
            width: '90%',
            alignSelf: 'center',
            backgroundColor: theme.yellow400,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
        },
        btnText: {
            color: theme.btnText,
            fontSize: 16,
            fontWeight: 'bold',
        },
        errorText: {
            textAlign: 'center',
            color: KolorKit.defaultColors.error500,
            margin: 8,
        },
        pressed: {
            opacity: 0.7,
        },
    });

    return (
        <View style={themedStyles.form}>
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
                    placeholder: "DD.MM.YYYY",
                    onChangeText: inputChangedHandler.bind(this, 'date'),
                    value: inputs.date.value,
                }}
            />
            {formIsInvalid && (
                <Text style={themedStyles.errorText}>Invalid input value - Please check your entered data! Name input must have more than 1 symbols.</Text>
            )}
            <Pressable
                style={({pressed}) => [themedStyles.btnConfirm, pressed && themedStyles.pressed]}
                onPress={submitHandler}
            >
                <Text style={themedStyles.btnText}>Confirm</Text>
            </Pressable>
        </View>
    )
}