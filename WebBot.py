import streamlit as st
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Menyiapkan data contoh
def create_sample_data():
    dates = pd.date_range(start='2023-01-01', periods=100)
    values = np.random.randn(100).cumsum()
    return pd.DataFrame({'Date': dates, 'Value': values})

data = create_sample_data()

# Layout Streamlit
st.title('Aplikasi Web dengan Streamlit')

menu = st.sidebar.selectbox('Pilih Menu', ['User Info', 'Grafik'])

if menu == 'User Info':
    st.header('Informasi Pengguna')
    st.write('Ini adalah bagian informasi pengguna. Anda bisa menambahkan informasi terkait pengguna di sini.')
    st.write(f'Jumlah data: {len(data)}')
    st.write(f'Rata-rata nilai: {data["Value"].mean():.2f}')
elif menu == 'Grafik':
    st.header('Grafik Data')
    st.write('Ini adalah grafik data berdasarkan nilai yang disediakan.')

    # Membuat grafik
    fig, ax = plt.subplots()
    ax.plot(data['Date'], data['Value'], label='Nilai')
    ax.set_xlabel('Tanggal')
    ax.set_ylabel('Nilai')
    ax.set_title('Grafik Nilai')
    ax.legend()

    # Menampilkan grafik di Streamlit
    st.pyplot(fig)