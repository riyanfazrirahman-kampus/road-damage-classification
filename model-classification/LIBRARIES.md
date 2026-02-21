## Library Utama

```sh
conda activate <nama_env>
```

```sh
conda install -c conda-forge cudatoolkit=11.2 cudnn=8.1.0
```

```sh
python -m pip install "tensorflow<2.11"
```

## Library lainya

```sh
pip install pandas matplotlib seaborn
```

```sh
pip install opencv-python==4.8.1.78 --force-reinstall
```

```sh
pip install pillow
```

```sh
pip install tqdm
```

```sh
pip install scikit-learn
```

Wajib downgrade `NumPy` ke versi <2:

```sh
pip install numpy==1.23.5 --force-reinstall
```
