import { useRef, useState } from 'react';
import { 
    Modal, 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    Dimensions,
    Animated,
    PanResponder
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import useTheme from '../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

const FullScreenImage = ({ source, visible, onClose }) => {
    const theme = useTheme();
    const [lastTap, setLastTap] = useState(0);
    const [isPanning, setIsPanning] = useState(false);
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const lastScale = useRef(1);
    const lastDistance = useRef(0);

    const resetImagePosition = (animate = true) => {
        if (animate) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true
                }),
                Animated.spring(translateX, {
                    toValue: 0,
                    friction: 3,
                    useNativeDriver: true
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 3,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            scale.setValue(1);
            translateX.setValue(0);
            translateY.setValue(0);
        }

        lastScale.current = 1;
        lastDistance.current = 0;
    };

    const handleClose = () => {
        resetImagePosition(false);
        onClose();
    };

    const handleDoubleTap = () => {
        if (isPanning) return;

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap < DOUBLE_TAP_DELAY) {
            if (scale._value !== 1) {
                resetImagePosition();
            } else {
                translateX.setValue(0);
                translateY.setValue(0);

                Animated.spring(scale, {
                    toValue: 2,
                    friction: 3,
                    useNativeDriver: true
                }).start();
                lastScale.current = 2;

                translateX.flattenOffset();
                translateY.flattenOffset();
            }
        }
        setLastTap(now);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                const { dx, dy } = gestureState;
                return Math.abs(dx) > 2 || Math.abs(dy) > 2;
            },
            onPanResponderGrant: () => {
                setIsPanning(true);
                translateX.extractOffset();
                translateY.extractOffset();
            },
            onPanResponderMove: (evt, gestureState) => {
                const touches = evt.nativeEvent.touches;

                if (touches.length >= 2) {
                    const touch1 = touches[0];
                    const touch2 = touches[1];

                    const dx = Math.abs(touch1.pageX - touch2.pageX);
                    const dy = Math.abs(touch1.pageY - touch2.pageY);
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (lastDistance.current === 0) {
                        lastDistance.current = distance;
                        return;
                    }

                    const newScale = lastScale.current * (distance / lastDistance.current);
                    
                    if (newScale >= 0.5 && newScale <= 5) {
                        scale.setValue(newScale);
                    }
                } 
                else {
                    translateX.setValue(gestureState.dx);
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: () => {
                setIsPanning(false);
                lastScale.current = scale._value;
                lastDistance.current = 0;

                translateX.flattenOffset();
                translateY.flattenOffset();

                if (scale._value <= 1 && 
                    (Math.abs(translateX._value) > width / 3 || 
                    Math.abs(translateY._value) > height / 3)) {
                    Animated.parallel([
                        Animated.spring(translateX, {
                            toValue: 0,
                            useNativeDriver: true
                        }),
                        Animated.spring(translateY, {
                            toValue: 0,
                            useNativeDriver: true
                        })
                    ]).start();
                }
            },
            onPanResponderTerminate: () => {
                setIsPanning(false);
            }
        })
    ).current;

    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            backgroundColor: theme.backgroundApp,
            opacity: 0.9,
            justifyContent: 'center',
            alignItems: 'center',
        },
        imageWrapper: {
            width: width,
            height: height,
            justifyContent: 'center',
            alignItems: 'center',
        },
        touchableArea: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        fullImage: {
            width: width * 0.9,
            height: height * 0.9,
        },
        closeButton: {
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 10,
            backgroundColor: theme.backgroundBox,
            opacity: 0.5,
            borderRadius: 20,
            padding: 8,
        },
    });

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={handleClose}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={28} color={theme.textWhite} />
                </TouchableOpacity>
                
                <View 
                    style={styles.imageWrapper}
                    {...panResponder.panHandlers}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={handleDoubleTap}
                        style={styles.touchableArea}
                    >
                        <Animated.Image
                            source={source}
                            style={[
                                styles.fullImage,
                                {
                                    transform: [
                                        { translateX: translateX },
                                        { translateY: translateY },
                                        { scale: scale }
                                    ]
                                }
                            ]}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default FullScreenImage; 