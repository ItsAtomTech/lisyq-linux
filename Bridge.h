#ifndef BRIDGE_H
#define BRIDGE_H


#include <QWebChannel>
#include <QObject>


class MainWindow; // forward declaration

class Bridge : public QObject
{
    Q_OBJECT

public:
    explicit Bridge(MainWindow *mw = nullptr, QObject *parent = nullptr)
        : QObject(parent), mainWindow(mw) {}

public slots:
    void put_data(const QString &data);
    void Save_To_File();
    bool AsNewTrigger();

    void onReady(){}

private:
    MainWindow *mainWindow; // pointer to the MainWindow instance
};





#endif // BRIDGE_H
