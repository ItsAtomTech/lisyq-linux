#ifndef BRIDGE_NEST_H
#define BRIDGE_NEST_H


#include <QWebChannel>
#include <QObject>

class NestWindow; // forward declaration

class Bridge_Nest : public QObject
{
    Q_OBJECT

public:
    explicit Bridge_Nest(NestWindow *mw = nullptr, QObject *parent = nullptr)
        : QObject(parent), nestWindow(mw) {}

     QString data_string_nt;

public slots:
    // void put_data(const QString &data);

    void onReady(){}

    // ================================
    // New PORT Channel Management
    // ================================

    bool add_comport(int index, const QString &portname);
    bool add_udpchannel(int index, const QString &address, int port);
    QString get_udplist_json();
    void disconnect_udp(int index);
    QString get_comlist();
    QString get_comports();
    void disconnect_com(int index);

    void set_values(int port, const QString &data);
    void outputs();

    void Show_template_scriptmenu();

    // Files
    void Open_File();

    void put_data_nt(const QString &data);
    void Save_File_NT();
    // Context Menus ===================



private:
    NestWindow *nestWindow; // pointer to the NestWindow instance



};





#endif // BRIDGE_NEST_H
