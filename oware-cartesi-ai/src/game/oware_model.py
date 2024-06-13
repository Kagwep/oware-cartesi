from keras.models import Sequential
from keras.layers import Dense, Dropout
from keras.optimizers import SGD

class OwareModel:
    def __init__(self):
        self.model = Sequential([
            Dense(18, input_dim=12, kernel_initializer='normal', activation='relu'),
            Dropout(0.1),
            Dense(9, kernel_initializer='normal', activation='relu'),
            Dropout(0.1),
            Dense(1, kernel_initializer='normal')
        ])
        
        learning_rate = 0.001
        momentum = 0.8
        optimizer = SGD(learning_rate=learning_rate, momentum=momentum, nesterov=False)
        
        self.model.compile(loss='mean_squared_error', optimizer=optimizer)
    
    def train(self, x_train, y_train, epochs=10, batch_size=32):
        return self.model.fit(x_train, y_train, epochs=epochs, batch_size=batch_size)
    
    def evaluate(self, x_test, y_test):
        return self.model.evaluate(x_test, y_test)
    
    def predict(self, x):
        return self.model.predict(x)
    
    def summary(self):
        return self.model.summary()
    
    def get_model(self):
        return self.model